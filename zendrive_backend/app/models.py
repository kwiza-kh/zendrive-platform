from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(40), nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Brand(Base):
    __tablename__ = "brands"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), unique=True, nullable=False)
    logo = Column(String(255), nullable=True)
    cars = relationship("Car", back_populates="brand")


class BodyType(Base):
    __tablename__ = "body_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(60), unique=True, nullable=False)
    sort_order = Column(Integer, default=0)


class Car(Base):
    __tablename__ = "cars"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False)
    slug = Column(String(180), unique=True, index=True, nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True)
    body_type = Column(String(40), default="Sedan")  # Sedan, SUV, Coupe, EV, Truck
    fuel_type = Column(String(20), default="Gasoline")  # Gasoline, Diesel, Hybrid, Electric
    transmission = Column(String(20), default="Automatic")
    year = Column(Integer, default=datetime.utcnow().year)
    mileage_km = Column(Integer, default=0)
    seats = Column(Integer, default=5)
    horsepower = Column(Integer, default=0)
    color = Column(String(40), default="Black")
    price = Column(Float, nullable=False)
    discount_price = Column(Float, nullable=True)
    description = Column(Text, default="")
    image = Column(String(255), nullable=True)
    images = Column(Text, default="")  # comma-separated extra images
    is_featured = Column(Boolean, default=False)
    is_new = Column(Boolean, default=True)
    in_stock = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    brand = relationship("Brand", back_populates="cars")


class ContactInfo(Base):
    __tablename__ = "contact_info"
    id = Column(Integer, primary_key=True, index=True)
    kind = Column(String(20), default="other")  # address | phone | email | hours | other
    label = Column(String(80), nullable=False)
    value = Column(String(500), nullable=False)
    link = Column(String(500), nullable=True)  # optional URL (e.g. Google Maps for address)
    sort_order = Column(Integer, default=0)


class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="cart_items")
    car = relationship("Car", backref="cart_items")


class Inquiry(Base):
    __tablename__ = "inquiries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    car_id = Column(Integer, ForeignKey("cars.id"), nullable=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), nullable=False)
    phone = Column(String(40), nullable=True)
    message = Column(Text, default="")
    status = Column(String(20), default="new")  # new, contacted, closed
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="inquiries")
    car = relationship("Car", backref="inquiries")


class SocialMedia(Base):
    __tablename__ = "social_media"
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(40), unique=True, nullable=False)  # instagram, facebook, twitter, etc.
    url = Column(String(500), default="")
    enabled = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
