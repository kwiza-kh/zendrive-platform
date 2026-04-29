import os
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_

from .database import get_db
from . import models, schemas
from .auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_admin,
)
from .config import settings
from .seed import init_db

app = FastAPI(title="Zendrive API", version="1.0.0")

_extra = os.environ.get("EXTRA_ALLOWED_ORIGINS", "")
_extra_origins = [o.strip() for o in _extra.split(",") if o.strip()]
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    *_extra_origins,
]

# Always allow any *.vercel.app preview/production URL so frontend deployments
# don't require redeploying the backend just to update the CORS allowlist.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Local-only static uploads. On Vercel the filesystem is read-only and we use
# Vercel Blob instead (see /api/upload below).
if not settings.IS_SERVERLESS:
    from fastapi.staticfiles import StaticFiles
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


_DB_INITIALIZED = False


@app.on_event("startup")
def on_startup():
    # Run idempotent seed on cold start. Safe to call repeatedly.
    global _DB_INITIALIZED
    if not _DB_INITIALIZED:
        try:
            init_db()
            _DB_INITIALIZED = True
        except Exception as e:
            # Don't crash the function if the DB isn't reachable yet — let
            # individual requests surface a clear error instead.
            print(f"[startup] init_db failed: {e}")


@app.get("/")
def root():
    return {"name": "Zendrive API", "status": "ok"}


# ==================== AUTH ====================
@app.post("/api/auth/register", response_model=schemas.Token)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
    )
    db.add(user); db.commit(); db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.post("/api/auth/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/api/auth/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user


# ==================== BRANDS ====================
@app.get("/api/brands", response_model=List[schemas.BrandOut])
def list_brands(db: Session = Depends(get_db)):
    return db.query(models.Brand).order_by(models.Brand.name).all()


@app.post("/api/brands", response_model=schemas.BrandOut)
def create_brand(payload: schemas.BrandCreate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name required")
    if db.query(models.Brand).filter(models.Brand.name == name).first():
        raise HTTPException(status_code=400, detail="Brand already exists")
    b = models.Brand(name=name, logo=payload.logo)
    db.add(b); db.commit(); db.refresh(b)
    return b


@app.put("/api/brands/{brand_id}", response_model=schemas.BrandOut)
def update_brand(brand_id: int, payload: schemas.BrandUpdate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    b = db.query(models.Brand).filter(models.Brand.id == brand_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Brand not found")
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        new_name = (data["name"] or "").strip()
        if not new_name:
            raise HTTPException(status_code=400, detail="Name required")
        dup = db.query(models.Brand).filter(models.Brand.name == new_name, models.Brand.id != brand_id).first()
        if dup:
            raise HTTPException(status_code=400, detail="Brand name already exists")
        b.name = new_name
    if "logo" in data:
        b.logo = data["logo"]
    db.commit(); db.refresh(b)
    return b


@app.delete("/api/brands/{brand_id}")
def delete_brand(brand_id: int, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    b = db.query(models.Brand).filter(models.Brand.id == brand_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Brand not found")
    used = db.query(models.Car).filter(models.Car.brand_id == brand_id).count()
    if used > 0:
        raise HTTPException(status_code=400, detail=f"Brand is used by {used} car(s). Reassign or delete those first.")
    db.delete(b); db.commit()
    return {"ok": True}


# ==================== BODY TYPES ====================
@app.get("/api/body-types", response_model=List[schemas.BodyTypeOut])
def list_body_types(db: Session = Depends(get_db)):
    return db.query(models.BodyType).order_by(models.BodyType.sort_order, models.BodyType.name).all()


@app.post("/api/body-types", response_model=schemas.BodyTypeOut)
def create_body_type(payload: schemas.BodyTypeCreate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name required")
    if db.query(models.BodyType).filter(models.BodyType.name == name).first():
        raise HTTPException(status_code=400, detail="Body type already exists")
    bt = models.BodyType(name=name, sort_order=payload.sort_order)
    db.add(bt); db.commit(); db.refresh(bt)
    return bt


@app.put("/api/body-types/{bt_id}", response_model=schemas.BodyTypeOut)
def update_body_type(bt_id: int, payload: schemas.BodyTypeUpdate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    bt = db.query(models.BodyType).filter(models.BodyType.id == bt_id).first()
    if not bt:
        raise HTTPException(status_code=404, detail="Body type not found")
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        new_name = (data["name"] or "").strip()
        if not new_name:
            raise HTTPException(status_code=400, detail="Name required")
        dup = db.query(models.BodyType).filter(models.BodyType.name == new_name, models.BodyType.id != bt_id).first()
        if dup:
            raise HTTPException(status_code=400, detail="Body type already exists")
        old_name = bt.name
        bt.name = new_name
        # Cascade rename so existing cars stay consistent
        db.query(models.Car).filter(models.Car.body_type == old_name).update({models.Car.body_type: new_name})
    if "sort_order" in data and data["sort_order"] is not None:
        bt.sort_order = data["sort_order"]
    db.commit(); db.refresh(bt)
    return bt


@app.delete("/api/body-types/{bt_id}")
def delete_body_type(bt_id: int, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    bt = db.query(models.BodyType).filter(models.BodyType.id == bt_id).first()
    if not bt:
        raise HTTPException(status_code=404, detail="Body type not found")
    used = db.query(models.Car).filter(models.Car.body_type == bt.name).count()
    if used > 0:
        raise HTTPException(status_code=400, detail=f"Body type is used by {used} car(s). Reassign or delete those first.")
    db.delete(bt); db.commit()
    return {"ok": True}


# ==================== CARS ====================
@app.get("/api/cars", response_model=List[schemas.CarOut])
def list_cars(
    db: Session = Depends(get_db),
    q: Optional[str] = None,
    brand_id: Optional[int] = None,
    body_type: Optional[str] = None,
    fuel_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_featured: Optional[bool] = None,
    sort: Optional[str] = Query(None, description="price_asc|price_desc|newest"),
    limit: int = 60,
    offset: int = 0,
):
    query = db.query(models.Car)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(models.Car.name.ilike(like), models.Car.description.ilike(like)))
    if brand_id is not None:
        query = query.filter(models.Car.brand_id == brand_id)
    if body_type:
        query = query.filter(models.Car.body_type == body_type)
    if fuel_type:
        query = query.filter(models.Car.fuel_type == fuel_type)
    if min_price is not None:
        query = query.filter(models.Car.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Car.price <= max_price)
    if is_featured is not None:
        query = query.filter(models.Car.is_featured == is_featured)

    if sort == "price_asc":
        query = query.order_by(models.Car.price.asc())
    elif sort == "price_desc":
        query = query.order_by(models.Car.price.desc())
    else:
        query = query.order_by(models.Car.created_at.desc())

    return query.offset(offset).limit(limit).all()


@app.get("/api/cars/{slug}", response_model=schemas.CarOut)
def get_car(slug: str, db: Session = Depends(get_db)):
    car = db.query(models.Car).filter(models.Car.slug == slug).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car


@app.post("/api/cars", response_model=schemas.CarOut)
def create_car(payload: schemas.CarCreate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    if db.query(models.Car).filter(models.Car.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")
    car = models.Car(**payload.model_dump())
    db.add(car); db.commit(); db.refresh(car)
    return car


@app.put("/api/cars/{car_id}", response_model=schemas.CarOut)
def update_car(car_id: int, payload: schemas.CarUpdate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(car, k, v)
    db.commit(); db.refresh(car)
    return car


@app.delete("/api/cars/{car_id}")
def delete_car(car_id: int, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    db.delete(car); db.commit()
    return {"ok": True}


# ==================== INQUIRIES ====================
@app.post("/api/inquiries", response_model=schemas.InquiryOut)
def create_inquiry(payload: schemas.InquiryCreate, db: Session = Depends(get_db)):
    inq = models.Inquiry(**payload.model_dump())
    db.add(inq); db.commit(); db.refresh(inq)
    return inq


@app.get("/api/inquiries", response_model=List[schemas.InquiryOut])
def list_inquiries(db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    return db.query(models.Inquiry).order_by(models.Inquiry.created_at.desc()).all()


@app.put("/api/inquiries/{inq_id}", response_model=schemas.InquiryOut)
def update_inquiry(inq_id: int, status: str, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    inq = db.query(models.Inquiry).filter(models.Inquiry.id == inq_id).first()
    if not inq:
        raise HTTPException(status_code=404, detail="Not found")
    inq.status = status
    db.commit(); db.refresh(inq)
    return inq


# ==================== CONTACT INFO ====================
@app.get("/api/contact-info", response_model=List[schemas.ContactInfoOut])
def list_contact_info(db: Session = Depends(get_db)):
    return (
        db.query(models.ContactInfo)
        .order_by(models.ContactInfo.sort_order, models.ContactInfo.id)
        .all()
    )


@app.post("/api/contact-info", response_model=schemas.ContactInfoOut)
def create_contact_info(payload: schemas.ContactInfoCreate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    item = models.ContactInfo(**payload.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return item


@app.put("/api/contact-info/{item_id}", response_model=schemas.ContactInfoOut)
def update_contact_info(item_id: int, payload: schemas.ContactInfoUpdate, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    item = db.query(models.ContactInfo).filter(models.ContactInfo.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit(); db.refresh(item)
    return item


@app.delete("/api/contact-info/{item_id}")
def delete_contact_info(item_id: int, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    item = db.query(models.ContactInfo).filter(models.ContactInfo.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item); db.commit()
    return {"ok": True}


# ==================== SOCIAL MEDIA ====================
@app.get("/api/social-media", response_model=List[schemas.SocialMediaOut])
def list_social_media_public(db: Session = Depends(get_db)):
    """Public endpoint — returns only enabled platforms."""
    return (
        db.query(models.SocialMedia)
        .filter(models.SocialMedia.enabled == True)
        .order_by(models.SocialMedia.sort_order)
        .all()
    )


@app.get("/api/social-media/all", response_model=List[schemas.SocialMediaOut])
def list_social_media_all(db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    """Admin endpoint — returns every platform regardless of enabled status."""
    return db.query(models.SocialMedia).order_by(models.SocialMedia.sort_order).all()


@app.put("/api/social-media/{platform}", response_model=schemas.SocialMediaOut)
def update_social_media(
    platform: str,
    payload: schemas.SocialMediaUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    item = db.query(models.SocialMedia).filter(models.SocialMedia.platform == platform).first()
    if not item:
        raise HTTPException(status_code=404, detail="Platform not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit(); db.refresh(item)
    return item


# ==================== UPLOAD ====================
ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}


@app.post("/api/upload")
async def upload(file: UploadFile = File(...), _: models.User = Depends(require_admin)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    import uuid
    name = f"{uuid.uuid4().hex}{ext}"
    data = await file.read()

    # On Vercel (read-only FS), upload to Vercel Blob.
    if settings.IS_SERVERLESS or settings.BLOB_READ_WRITE_TOKEN:
        token = settings.BLOB_READ_WRITE_TOKEN
        if not token:
            raise HTTPException(
                status_code=500,
                detail="BLOB_READ_WRITE_TOKEN is not configured on the server.",
            )
        import httpx
        content_type = file.content_type or "application/octet-stream"
        # Vercel Blob "PUT /<pathname>" upload API.
        # Docs: https://vercel.com/docs/storage/vercel-blob/using-blob-sdk
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.put(
                    f"https://blob.vercel-storage.com/{name}",
                    content=data,
                    headers={
                        "authorization": f"Bearer {token}",
                        "x-content-type": content_type,
                        "x-add-random-suffix": "0",
                        "x-api-version": "7",
                    },
                )
            if resp.status_code >= 300:
                raise HTTPException(status_code=502, detail=f"Blob upload failed: {resp.text[:200]}")
            url = resp.json().get("url")
            if not url:
                raise HTTPException(status_code=502, detail="Blob upload returned no URL")
            return {"url": url}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Blob upload error: {e}")

    # Local dev — write to ./uploads.
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    path = os.path.join(settings.UPLOAD_DIR, name)
    with open(path, "wb") as f:
        f.write(data)
    return {"url": f"/uploads/{name}"}
