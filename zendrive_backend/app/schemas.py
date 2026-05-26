from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    is_admin: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class BrandBase(BaseModel):
    name: str
    logo: Optional[str] = None


class BrandCreate(BrandBase):
    pass


class BrandUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None


class BrandOut(BrandBase):
    id: int

    class Config:
        from_attributes = True


class BodyTypeBase(BaseModel):
    name: str
    sort_order: int = 0


class BodyTypeCreate(BodyTypeBase):
    pass


class BodyTypeUpdate(BaseModel):
    name: Optional[str] = None
    sort_order: Optional[int] = None


class BodyTypeOut(BodyTypeBase):
    id: int

    class Config:
        from_attributes = True


class CarBase(BaseModel):
    name: str
    slug: str
    brand_id: Optional[int] = None
    body_type: str = "Sedan"
    fuel_type: str = "Gasoline"
    transmission: str = "Automatic"
    year: int = 2025
    mileage_km: int = 0
    seats: int = 5
    horsepower: int = 0
    color: str = "Black"
    price: float
    discount_price: Optional[float] = None
    description: str = ""
    image: Optional[str] = None
    images: str = ""
    is_featured: bool = False
    is_new: bool = True
    in_stock: bool = True


class CarCreate(CarBase):
    pass


class CarUpdate(BaseModel):
    name: Optional[str] = None
    brand_id: Optional[int] = None
    body_type: Optional[str] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    year: Optional[int] = None
    mileage_km: Optional[int] = None
    seats: Optional[int] = None
    horsepower: Optional[int] = None
    color: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    description: Optional[str] = None
    image: Optional[str] = None
    images: Optional[str] = None
    is_featured: Optional[bool] = None
    is_new: Optional[bool] = None
    in_stock: Optional[bool] = None


class CarOut(CarBase):
    id: int
    created_at: datetime
    brand: Optional[BrandOut] = None

    class Config:
        from_attributes = True


class ContactInfoBase(BaseModel):
    kind: str = "other"
    label: str
    value: str
    link: Optional[str] = None
    sort_order: int = 0


class ContactInfoCreate(ContactInfoBase):
    pass


class ContactInfoUpdate(BaseModel):
    kind: Optional[str] = None
    label: Optional[str] = None
    value: Optional[str] = None
    link: Optional[str] = None
    sort_order: Optional[int] = None


class ContactInfoOut(ContactInfoBase):
    id: int

    class Config:
        from_attributes = True


class SocialMediaOut(BaseModel):
    id: int
    platform: str
    url: str
    enabled: bool
    sort_order: int

    class Config:
        from_attributes = True


class SocialMediaUpdate(BaseModel):
    url: Optional[str] = None
    enabled: Optional[bool] = None
    sort_order: Optional[int] = None
