from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone_number: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=6, max_length=128)


class UserLoginRequest(BaseModel):
    identifier: Optional[str] = Field(None, description="Email address or Mobile Number")
    email: Optional[str] = Field(None, description="Fallback email address")
    password: str = Field(..., min_length=1, max_length=128)


class MobileOtpRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=20)


class MobileOtpVerifyRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=20)
    otp: str = Field(..., min_length=4, max_length=8)
    name: Optional[str] = Field(None, max_length=100)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str
    new_password: str = Field(..., min_length=6, max_length=128)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
