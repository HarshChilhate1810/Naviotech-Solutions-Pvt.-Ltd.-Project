"""add_phone_number_to_users

Revision ID: 9f8e7d6c5b4a
Revises: 584f69425c5f
Create Date: 2026-10-30 18:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9f8e7d6c5b4a'
down_revision: Union[str, None] = '584f69425c5f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    try:
        op.add_column('users', sa.Column('phone_number', sa.String(length=20), nullable=True))
        op.create_index(op.f('ix_users_phone_number'), 'users', ['phone_number'], unique=True)
    except Exception:
        pass


def downgrade() -> None:
    op.drop_index(op.f('ix_users_phone_number'), table_name='users')
    op.drop_column('users', 'phone_number')

