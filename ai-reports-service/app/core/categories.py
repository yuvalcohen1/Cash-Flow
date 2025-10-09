# app/core/categories.py

# Category mappings - synced with main backend
CATEGORIES = {
    # Income Categories
    1: "Salary",
    2: "Freelance",
    3: "Investment",
    4: "Bonus",
    5: "Rental Income",
    6: "Business Income",
    7: "Other Income",
    
    # Expense Categories
    8: "Food & Dining",
    9: "Transportation",
    10: "Shopping",
    11: "Entertainment",
    12: "Bills & Utilities",
    13: "Healthcare",
    14: "Education",
    15: "Travel",
    16: "Insurance",
    17: "Home & Garden",
    18: "Gifts & Donations",
    19: "Personal Care",
    20: "Subscriptions",
    21: "Other Expense",
}

CATEGORY_TYPES = {
    # Income Categories
    1: "income", 2: "income", 3: "income", 4: "income",
    5: "income", 6: "income", 7: "income",
    
    # Expense Categories
    8: "expense", 9: "expense", 10: "expense", 11: "expense",
    12: "expense", 13: "expense", 14: "expense", 15: "expense",
    16: "expense", 17: "expense", 18: "expense", 19: "expense",
    20: "expense", 21: "expense",
}


def get_category_name(category_id) -> str:
    """
    Get category name from ID, return string version of ID if not found
    """
    try:
        cat_id = int(category_id)
        return CATEGORIES.get(cat_id, f"Category {cat_id}")
    except (ValueError, TypeError):
        return str(category_id)


def get_category_type(category_id) -> str:
    """
    Get category type (income/expense) from ID
    """
    try:
        cat_id = int(category_id)
        return CATEGORY_TYPES.get(cat_id, "unknown")
    except (ValueError, TypeError):
        return "unknown"