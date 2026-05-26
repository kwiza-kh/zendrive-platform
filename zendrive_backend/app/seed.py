from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from . import models
from .auth import hash_password
from .config import settings


SAMPLE_BRANDS = ["Tesla", "BMW", "Mercedes-Benz", "Audi", "Toyota", "Porsche", "Lexus", "Ford"]

DEFAULT_BODY_TYPES = ["Sedan", "SUV", "Coupe", "Truck", "Convertible", "Wagon", "Hatchback"]

SAMPLE_CARS = [
    {
        "name": "Tesla Model S Plaid",
        "slug": "tesla-model-s-plaid",
        "brand": "Tesla",
        "body_type": "Sedan",
        "fuel_type": "Electric",
        "transmission": "Automatic",
        "year": 2025,
        "mileage_km": 1200,
        "seats": 5,
        "horsepower": 1020,
        "color": "Pearl White",
        "price": 129990,
        "discount_price": 119990,
        "description": "Tri-motor all-wheel drive with 0–100 km/h in 2.1s. The pinnacle of electric performance.",
        "image": "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200",
        "is_featured": True,
        "is_new": True,
    },
    {
        "name": "BMW M4 Competition",
        "slug": "bmw-m4-competition",
        "brand": "BMW",
        "body_type": "Coupe",
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "year": 2024,
        "mileage_km": 8500,
        "seats": 4,
        "horsepower": 503,
        "color": "Sao Paulo Yellow",
        "price": 89990,
        "description": "Track-bred performance with twin-turbo inline-six and adaptive M suspension.",
        "image": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200",
        "is_featured": True,
    },
    {
        "name": "Mercedes-Benz S 580",
        "slug": "mercedes-benz-s-580",
        "brand": "Mercedes-Benz",
        "body_type": "Sedan",
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "year": 2024,
        "mileage_km": 5200,
        "seats": 5,
        "horsepower": 496,
        "color": "Obsidian Black",
        "price": 119500,
        "description": "Flagship luxury redefined with Hyperscreen, executive rear seats and air suspension.",
        "image": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200",
        "is_featured": True,
    },
    {
        "name": "Audi RS e-tron GT",
        "slug": "audi-rs-e-tron-gt",
        "brand": "Audi",
        "body_type": "Sedan",
        "fuel_type": "Electric",
        "transmission": "Automatic",
        "year": 2025,
        "mileage_km": 0,
        "seats": 4,
        "horsepower": 637,
        "color": "Tactical Green",
        "price": 145000,
        "description": "Quattro all-wheel drive electric grand tourer with 800V architecture.",
        "image": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200",
        "is_new": True,
    },
    {
        "name": "Porsche 911 Carrera S",
        "slug": "porsche-911-carrera-s",
        "brand": "Porsche",
        "body_type": "Coupe",
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "year": 2024,
        "mileage_km": 3400,
        "seats": 4,
        "horsepower": 443,
        "color": "Guards Red",
        "price": 132000,
        "description": "Iconic rear-engine sports car with PDK and rear-wheel steering.",
        "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
        "is_featured": True,
    },
    {
        "name": "Toyota Land Cruiser 300",
        "slug": "toyota-land-cruiser-300",
        "brand": "Toyota",
        "body_type": "SUV",
        "fuel_type": "Hybrid",
        "transmission": "Automatic",
        "year": 2024,
        "mileage_km": 14500,
        "seats": 7,
        "horsepower": 409,
        "color": "Sand Beige",
        "price": 95000,
        "description": "Legendary off-road capability with twin-turbo V6 and full-time 4WD.",
        "image": "https://images.unsplash.com/photo-1612825173281-9a193378527e?w=1200",
    },
    {
        "name": "Lexus LX 600",
        "slug": "lexus-lx-600",
        "brand": "Lexus",
        "body_type": "SUV",
        "fuel_type": "Gasoline",
        "transmission": "Automatic",
        "year": 2024,
        "mileage_km": 6700,
        "seats": 7,
        "horsepower": 409,
        "color": "Manganese Luster",
        "price": 108000,
        "description": "Luxury full-size SUV with three-row seating and premium audio.",
        "image": "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=1200",
    },
    {
        "name": "Ford Mustang GT",
        "slug": "ford-mustang-gt",
        "brand": "Ford",
        "body_type": "Coupe",
        "fuel_type": "Gasoline",
        "transmission": "Manual",
        "year": 2024,
        "mileage_km": 4200,
        "seats": 4,
        "horsepower": 480,
        "color": "Race Red",
        "price": 52000,
        "discount_price": 48500,
        "description": "Iconic American muscle with 5.0L Coyote V8 and active exhaust.",
        "image": "https://images.unsplash.com/photo-1547245324-d777c6f05e80?w=1200",
    },
]
def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Admin
        admin = db.query(models.User).filter(models.User.email == settings.ADMIN_EMAIL).first()
        if not admin:
            admin = models.User(
                name="Zendrive Admin",
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                is_admin=True,
            )
            db.add(admin)
            db.commit()

        # Brands
        brand_map = {}
        for name in SAMPLE_BRANDS:
            b = db.query(models.Brand).filter(models.Brand.name == name).first()
            if not b:
                b = models.Brand(name=name)
                db.add(b)
                db.commit()
                db.refresh(b)
            brand_map[name] = b.id

        # Body Types (idempotent seed; admin can add/edit/delete via API)
        for idx, name in enumerate(DEFAULT_BODY_TYPES):
            existing = db.query(models.BodyType).filter(models.BodyType.name == name).first()
            if not existing:
                db.add(models.BodyType(name=name, sort_order=idx))
        db.commit()

        # Cars
        if db.query(models.Car).count() == 0:
            for c in SAMPLE_CARS:
                payload = c.copy()
                payload["brand_id"] = brand_map.get(payload.pop("brand", None))
                db.add(models.Car(**payload))
            db.commit()

        # Default contact info (idempotent)
        if db.query(models.ContactInfo).count() == 0:
            db.add_all([
                models.ContactInfo(
                    kind="address", label="Showroom",
                    value="120 Highline Ave, Suite 800, NY 10001",
                    link="https://www.google.com/maps/search/?api=1&query=120+Highline+Ave+Suite+800+NY+10001",
                    sort_order=0,
                ),
                models.ContactInfo(kind="phone", label="Phone", value="+1 (555) 936-7483", link="tel:+15559367483", sort_order=1),
                models.ContactInfo(kind="email", label="Email", value="hello@zendrive.com", link="mailto:hello@zendrive.com", sort_order=2),
                models.ContactInfo(kind="hours", label="Hours", value="Mon–Sat: 9am – 8pm · Sun: 10am – 6pm", link=None, sort_order=3),
            ])
            db.commit()

        # Social media platforms (idempotent – add missing rows, never delete)
        DEFAULT_SOCIAL = [
            ("instagram", 0),
            ("facebook",  1),
            ("twitter",   2),
            ("youtube",   3),
            ("linkedin",  4),
            ("tiktok",    5),
            ("telegram",  6),
            ("whatsapp",  7),
        ]
        for platform, order in DEFAULT_SOCIAL:
            exists = db.query(models.SocialMedia).filter(models.SocialMedia.platform == platform).first()
            if not exists:
                db.add(models.SocialMedia(platform=platform, url="", enabled=False, sort_order=order))
        db.commit()
    finally:
        db.close()
