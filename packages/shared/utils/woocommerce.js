import axios from "axios";

class WooCommerceAPI {
  constructor() {
    // Lazy initialization - don't check env vars until actually used
  }

  _ensureConfigured() {
    if (!this.baseURL || !this.consumerKey || !this.consumerSecret) {
      this.baseURL = process.env.WC_BASE_URL;
      this.consumerKey = process.env.WC_CONSUMER_KEY;
      this.consumerSecret = process.env.WC_CONSUMER_SECRET;

      if (!this.baseURL || !this.consumerKey || !this.consumerSecret) {
        throw new Error("WooCommerce environment variables not configured");
      }
    }
  }

  async getProducts(page = 1, perPage = 100) {
    this._ensureConfigured();
    try {
      const response = await axios.get(
        `${this.baseURL}/wp-json/wc/v3/products`,
        {
          params: {
            consumer_key: this.consumerKey,
            consumer_secret: this.consumerSecret,
            page,
            per_page: perPage,
          },
        }
      );

      return {
        products: response.data,
        totalPages: parseInt(response.headers["x-wp-totalpages"]) || 1,
        totalProducts: parseInt(response.headers["x-wp-total"]) || 0,
      };
    } catch (error) {
      console.error("Error fetching products from WooCommerce:", error.message);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  mapProductToSchema(wcProduct) {
    this._ensureConfigured();
    return {
      id: wcProduct.id,
      title: wcProduct.name,
      price: wcProduct.price || "0",
      stock_status: wcProduct.stock_status || "outofstock",
      stock_quantity:
        wcProduct.stock_quantity !== null
          ? parseInt(wcProduct.stock_quantity)
          : null,
      category:
        wcProduct.categories && wcProduct.categories.length > 0
          ? wcProduct.categories[0].name
          : null,
      tags: wcProduct.tags ? wcProduct.tags.map((tag) => tag.name) : [],
      on_sale: wcProduct.on_sale || false,
    };
  }
}

export default new WooCommerceAPI();
