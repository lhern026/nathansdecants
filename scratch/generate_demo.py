import json
import csv
import os

# Base path for the scraped data
data_path = "/Users/luishernandez/code/newmock/scratch/products.json"

def generate_csv():
    try:
        with open(data_path, 'r') as f:
            data = json.load(f)
            
        products = data.get('products', [])
        
        # Shopify CSV headers
        headers = [
            "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
            "Option1 Name", "Option1 Value", "Variant SKU", "Variant Grams", "Variant Inventory Tracker",
            "Variant Inventory Qty", "Variant Inventory Policy", "Variant Fulfillment Service",
            "Variant Price", "Variant Compare At Price", "Variant Requires Shipping", "Variant Taxable",
            "Variant Barcode", "Image Src", "Image Position", "Status"
        ]

        with open('nathan-products-import.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            
            for prod in products:
                handle = prod.get('handle', '')
                title = prod.get('title', '')
                body = prod.get('body_html', '')
                vendor = prod.get('vendor', '')
                
                # Use first image if available
                images = prod.get('images', [])
                img_src = images[0].get('src', '') if images else ''
                
                variants = prod.get('variants', [])
                for i, var in enumerate(variants):
                    option_val = var.get('option1', '')
                    price = var.get('price', '')
                    grams = var.get('grams', 0)
                    
                    row = [
                        handle, title, body, vendor, "", "Decant", "", "TRUE",
                        "Size", option_val, "", grams, "", "100", "deny", "manual",
                        price, "", "TRUE", "TRUE", "", img_src if i == 0 else "", 1 if i == 0 else "", "active"
                    ]
                    writer.writerow(row)
        
        print(f"Successfully generated CSV with {len(products)} products.")
        return products
    except Exception as e:
        print(f"Error: {e}")
        return None

def generate_preview_html(products):
    if not products: return
    
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nathan's Decants - Real Data Preview</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
"""
    # Read the CSS I wrote earlier to embed it
    try:
        with open('assets/theme.css', 'r') as css_file:
            html_content += css_file.read()
    except:
        pass

    html_content += """
    </style>
</head>
<body>
    <header class="site-header">
        <div class="hamburger"><span></span><span></span><span></span></div>
        <div class="header-logo">NATHAN'S DECANTS</div>
        <nav class="header-nav">
            <a href="#">Home</a>
            <a href="#">Catalog</a>
            <a href="#">Contact</a>
        </nav>
        <div class="header-actions">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
    </header>

    <section class="hero">
        <div class="hero__media">
            <img src="https://cdn.shopify.com/s/files/1/0955/1062/6600/files/13928708_fpx.webp?v=1775337324" alt="Hero">
            <div class="hero__overlay"></div>
        </div>
        <div class="hero__content reveal">
            <span class="hero__eyebrow">ESTABLISHED 2024</span>
            <h1 class="hero__title">Nathan's Decants</h1>
            <p class="hero__subtitle">Real product data preview. Curated decants, poured by hand.</p>
            <a href="#collection" class="btn"><span>Explore View</span><span class="btn__icon">→</span></a>
        </div>
    </section>

    <div class="marquee" aria-hidden="true">
        <div class="marquee__track">
            <div class="marquee__item">PREMIUM DECANTS • WORLDWIDE SHIPPING • NATHAN'S SELECTS</div>
            <div class="marquee__item">PREMIUM DECANTS • WORLDWIDE SHIPPING • NATHAN'S SELECTS</div>
            <div class="marquee__item">PREMIUM DECANTS • WORLDWIDE SHIPPING • NATHAN'S SELECTS</div>
        </div>
    </div>

    <section id="collection" class="section">
        <div class="container">
            <div class="section-header reveal">
                <span class="section-eyebrow">Curated Selection</span>
                <h2 class="section-title">The Entire Collection</h2>
            </div>
            <div class="product-grid">
    """
    
    for prod in products:
        images = prod.get('images', [])
        img_src = images[0].get('src', '') if images else ''
        title = prod.get('title', '')
        vendor = prod.get('vendor', 'Nathan\'s Decants')
        price = prod.get('variants', [{}])[0].get('price', '0.00')
        
        img_html = f'<img src="{img_src}" alt="{title}" loading="lazy">' if img_src else f'<div class="product-card__image-fallback"><span>{title}</span></div>'
        
        html_content += f"""
                <div class="product-card reveal">
                    <div class="product-card__shell">
                        <div class="product-card__inner">
                            <div class="product-card__image-wrap">
                                {img_html}
                            </div>
                            <div class="product-card__info">
                                <div class="product-card__vendor">{vendor}</div>
                                <h3 class="product-card__title">{title}</h3>
                                <div class="product-card__price">${price}</div>
                            </div>
                        </div>
                    </div>
                </div>
        """

    html_content += """
            </div>
        </div>
    </section>

    <script>
    """
    # Read the JS I wrote earlier
    try:
        with open('assets/theme.js', 'r') as js_file:
            html_content += js_file.read()
    except:
        pass

    html_content += """
    </script>
</body>
</html>
"""
    with open('preview-storefront.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("Successfully generated preview-storefront.html.")

if __name__ == "__main__":
    products = generate_csv()
    if products:
        generate_preview_html(products)
