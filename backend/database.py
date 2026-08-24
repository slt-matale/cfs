import os

from dotenv import load_dotenv
from supabase import create_client

# Loads variables from a local .env file when running locally.
# On Hugging Face Spaces / Render / etc, set these as "Secrets" /
# environment variables in the platform's dashboard instead of a .env file.
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "SUPABASE_URL and SUPABASE_KEY must be set as environment "
        "variables (or in a local .env file). Never hardcode them "
        "in source code."
    )

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
