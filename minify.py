import os
import re
import shutil

def minify_css(css):
    # Remove comments
    css = re.sub(r'/\*[\s\S]*?\*/', '', css)
    # Remove whitespace around delimiters
    css = re.sub(r'\s*([\{\}\:\;\,\>])\s*', r'\1', css)
    # Remove remaining extra spaces/newlines
    css = re.sub(r'\s+', ' ', css)
    return css.strip()

def minify_js(js):
    # Remove single line comments
    js = re.sub(r'(?<!:)\/\/(?!.*["\']).*$', '', js, flags=re.MULTILINE)
    # Remove multi-line comments
    js = re.sub(r'/\*[\s\S]*?\*/', '', js)
    return js.strip()

def minify_html(html):
    # Remove HTML comments
    html = re.sub(r'<!--(?!\[if)[\s\S]*?-->', '', html)
    # Collapse multiple whitespace
    html = re.sub(r'>\s+<', '><', html)
    return html.strip()

def build():
    print("Starting production build and minification...")
    dist_dir = 'dist'
    
    if os.path.exists(dist_dir):
        shutil.rmtree(dist_dir)
    os.makedirs(dist_dir)
    
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()
    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()
    with open('script.js', 'r', encoding='utf-8') as f:
        js = f.read()
    with open('config.js', 'r', encoding='utf-8') as f:
        config = f.read()
        
    print("Minifying CSS...")
    min_css = minify_css(css)
    print("Minifying JavaScript...")
    min_js = minify_js(js)
    min_config = minify_js(config)
    print("Minifying HTML...")
    min_html = minify_html(html)
    
    with open(os.path.join(dist_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(min_html)
    with open(os.path.join(dist_dir, 'style.css'), 'w', encoding='utf-8') as f:
        f.write(min_css)
    with open(os.path.join(dist_dir, 'script.js'), 'w', encoding='utf-8') as f:
        f.write(min_js)
    with open(os.path.join(dist_dir, 'config.js'), 'w', encoding='utf-8') as f:
        f.write(min_config)
        
    assets_src = 'assets'
    if os.path.exists(assets_src):
        print("Copying assets...")
        shutil.copytree(assets_src, os.path.join(dist_dir, 'assets'), dirs_exist_ok=True)
        
    for extra_file in ['robots.txt', 'sitemap.xml', 'site.webmanifest', 'favicon.ico']:
        if os.path.exists(extra_file):
            print(f"Copying {extra_file}...")
            shutil.copy(extra_file, os.path.join(dist_dir, extra_file))
            
    print("SUCCESS: Production build complete! Deployed files are generated in 'dist/' directory.")

if __name__ == '__main__':
    build()
