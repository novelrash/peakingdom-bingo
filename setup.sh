#!/usr/bin/env bash
# Local dev setup — run once after cloning
set -e

echo "==> Setting up backend..."
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp -n .env.example .env
echo "    Edit backend/.env with your Supabase credentials"
cd ..

echo "==> Setting up frontend..."
cd frontend
npm install
cp -n .env.example .env
echo "    Edit frontend/.env with your Supabase credentials"
cd ..

echo ""
echo "=== Next steps ============================================"
echo " 1. Create a Supabase project at https://supabase.com"
echo "    - Paste supabase/schema.sql into the SQL Editor and run"
echo "    - Go to Authentication > Users and create an admin user"
echo "    - Copy URL + anon key into frontend/.env"
echo "    - Copy URL + service_role key into backend/.env"
echo ""
echo " 2. Start backend:"
echo "    cd backend && source .venv/bin/activate && uvicorn main:app --reload"
echo ""
echo " 3. Start frontend (new terminal):"
echo "    cd frontend && npm run dev"
echo ""
echo " 4. Open http://localhost:5173"
echo "==========================================================="
