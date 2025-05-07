"""
Unit tests for the Product model.
"""

import pytest
from src.models.product import Product


@pytest.mark.unit
@pytest.mark.model
class TestProduct:
    """Test cases for the Product model."""

    def test_product_creation(self):
        """Test that a product can be created with valid parameters."""
        product = Product(
            id="test-product-1",
            name="Test Product",
            length=40,
            width=48,
            height=48,
            weight=1000,
            units="in",
            velocity_class="A",
            storage_requirements=["standard"],
        )
        
        assert product.id == "test-product-1"
        assert product.name == "Test Product"
        assert product.length == 40
        assert product.width == 48
        assert product.height == 48
        assert product.weight == 1000
        assert product.units == "in"
        assert product.velocity_class == "A"
        assert "standard" in product.storage_requirements
        
    def test_product_volume(self):
        """Test calculation of product volume."""
        product = Product(
            id="test-product-2",
            name="Test Product for Volume",
            length=40,
            width=48,
            height=48,
            weight=1000,
            units="in",
            velocity_class="A",
            storage_requirements=["standard"],
        )
        
        # Volume in cubic inches: 40 * 48 * 48 = 92,160
        assert product.volume == 92160
        
    def test_product_density(self):
        """Test calculation of product density."""
        product = Product(
            id="test-product-3",
            name="Test Product for Density",
            length=40,
            width=48,
            height=48,
            weight=1000,
            units="in",
            velocity_class="A",
            storage_requirements=["standard"],
        )
        
        # Density = weight / volume = 1000 / 92160 ≈ 0.01085
        assert product.density == pytest.approx(0.01085, rel=1e-4)
        
    def test_product_validation(self):
        """Test that product validation works correctly."""
        # Invalid dimensions (negative)
        with pytest.raises(ValueError):
            Product(
                id="invalid-product",
                name="Invalid Product",
                length=-40,  # Negative length
                width=48,
                height=48,
                weight=1000,
                units="in",
                velocity_class="A",
                storage_requirements=["standard"],
            )
            
        # Invalid weight (negative)
        with pytest.raises(ValueError):
            Product(
                id="invalid-product",
                name="Invalid Product",
                length=40,
                width=48,
                height=48,
                weight=-1000,  # Negative weight
                units="in",
                velocity_class="A",
                storage_requirements=["standard"],
            )
            
        # Invalid velocity class
        with pytest.raises(ValueError):
            Product(
                id="invalid-product",
                name="Invalid Product",
                length=40,
                width=48,
                height=48,
                weight=1000,
                units="in",
                velocity_class="X",  # Invalid velocity class
                storage_requirements=["standard"],
            )
            
    def test_product_with_custom_storage_requirements(self):
        """Test that a product can be created with custom storage requirements."""
        product = Product(
            id="test-product-4",
            name="Test Product with Custom Storage",
            length=40,
            width=48,
            height=48,
            weight=1000,
            units="in",
            velocity_class="A",
            storage_requirements=["refrigerated", "hazardous"],
        )
        
        assert "refrigerated" in product.storage_requirements
        assert "hazardous" in product.storage_requirements
        assert len(product.storage_requirements) == 2
        
    def test_product_to_dict(self):
        """Test conversion of product to dictionary."""
        product = Product(
            id="test-product-5",
            name="Test Product",
            length=40,
            width=48,
            height=48,
            weight=1000,
            units="in",
            velocity_class="A",
            storage_requirements=["standard"],
        )
        
        product_dict = product.to_dict()
        assert isinstance(product_dict, dict)
        assert product_dict["id"] == "test-product-5"
        assert product_dict["name"] == "Test Product"
        assert product_dict["length"] == 40
        assert product_dict["width"] == 48
        assert product_dict["height"] == 48
        assert product_dict["weight"] == 1000
        assert product_dict["units"] == "in"
        assert product_dict["velocity_class"] == "A"
        assert "standard" in product_dict["storage_requirements"]
        assert "volume" in product_dict
        assert "density" in product_dict
        
    def test_product_unit_conversion(self):
        """Test unit conversion for product dimensions."""
        # Create product with inches
        product_inches = Product(
            id="test-product-6a",
            name="Test Product in Inches",
            length=40,
            width=48,
            height=48,
            weight=1000,
            units="in",
            velocity_class="A",
            storage_requirements=["standard"],
        )
        
        # Create equivalent product with feet
        product_feet = Product(
            id="test-product-6b",
            name="Test Product in Feet",
            length=40/12,  # 3.33 ft
            width=48/12,   # 4 ft
            height=48/12,  # 4 ft
            weight=1000,
            units="ft",
            velocity_class="A",
            storage_requirements=["standard"],
        )
        
        # Volumes should be equivalent when accounting for unit conversion
        # Volume in cubic inches: 40 * 48 * 48 = 92,160
        # Volume in cubic feet: (40/12) * (48/12) * (48/12) = 3.33 * 4 * 4 = 53.33
        # 92,160 cubic inches = 53.33 cubic feet
        assert product_inches.volume_cubic_feet == pytest.approx(product_feet.volume)