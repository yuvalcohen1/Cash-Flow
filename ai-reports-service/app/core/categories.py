from enum import Enum
from typing import Dict, NamedTuple

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class CategoryInfo(NamedTuple):
    name: str
    type: TransactionType

CATEGORIES: Dict[int, CategoryInfo] = {
    # Income
    1: CategoryInfo("Salary", TransactionType.INCOME),
    2: CategoryInfo("Freelance", TransactionType.INCOME),
    3: CategoryInfo("Investment", TransactionType.INCOME),
    4: CategoryInfo("Bonus", TransactionType.INCOME),
    5: CategoryInfo("Rental Income", TransactionType.INCOME),
    6: CategoryInfo("Business Income", TransactionType.INCOME),
    7: CategoryInfo("Other Income", TransactionType.INCOME),
    
    # Expenses
    8: CategoryInfo("Food & Dining", TransactionType.EXPENSE),
    9: CategoryInfo("Transportation", TransactionType.EXPENSE),
    10: CategoryInfo("Shopping", TransactionType.EXPENSE),
    11: CategoryInfo("Entertainment", TransactionType.EXPENSE),
    12: CategoryInfo("Bills & Utilities", TransactionType.EXPENSE),
    13: CategoryInfo("Healthcare", TransactionType.EXPENSE),
    14: CategoryInfo("Education", TransactionType.EXPENSE),
    15: CategoryInfo("Travel", TransactionType.EXPENSE),
    16: CategoryInfo("Insurance", TransactionType.EXPENSE),
    17: CategoryInfo("Home & Garden", TransactionType.EXPENSE),
    18: CategoryInfo("Gifts & Donations", TransactionType.EXPENSE),
    19: CategoryInfo("Personal Care", TransactionType.EXPENSE),
    20: CategoryInfo("Subscriptions", TransactionType.EXPENSE),
    21: CategoryInfo("Other Expense", TransactionType.EXPENSE),
}

def get_category_name(category_id: int) -> str:
    """Get category name from ID"""
    try:
        return CATEGORIES.get(category_id, CategoryInfo(f"Category {category_id}", TransactionType.EXPENSE)).name
    except (ValueError, TypeError):
        return str(category_id)

def get_category_type(category_id: int) -> str:
    """Get category type (income/expense) from ID"""
    try:
        return CATEGORIES.get(category_id, CategoryInfo("Unknown", TransactionType.EXPENSE)).type.value
    except (ValueError, TypeError):
        return "unknown"