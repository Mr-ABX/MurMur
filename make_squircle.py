from PIL import Image, ImageDraw

def make_squircle(img_path, out_path, border_radius=22.5):
    img = Image.open(img_path).convert("RGBA")
    
    # Calculate radius based on Apple's standard 22.5% of width for icon squircles
    w, h = img.size
    r = int(min(w, h) * (border_radius / 100.0))
    
    # Create mask
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, w, h), radius=r, fill=255)
    
    # Apply mask
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    
    out.save(out_path)

make_squircle("/Users/anonymax/.gemini/antigravity/brain/9fd16499-bcdb-427f-be86-f508cf724ab4/murmur_app_logo_v2_1783560863885.jpg", "app-icon-transparent.png")
