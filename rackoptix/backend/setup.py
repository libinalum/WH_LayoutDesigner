from setuptools import setup, find_packages

setup(
    name="rackoptix-engine",
    version="0.1.0",
    description="RackOptix Warehouse Layout Optimization Engine",
    author="RackOptix Team",
    author_email="team@rackoptix.com",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.9",
    install_requires=[
        "numpy>=1.24.0",
        "pandas>=2.0.0",
        "scipy>=1.10.0",
        "ortools>=9.6.0",
        "shapely>=2.0.0",
        "psycopg2-binary>=2.9.0",
        "fastapi>=0.95.0",
        "uvicorn>=0.22.0",
        "pydantic>=1.10.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.3.0",
            "black>=23.3.0",
            "isort>=5.12.0",
            "mypy>=1.3.0",
        ],
    },
)