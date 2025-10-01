import os
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Use a standard mobile viewport size
        page = browser.new_page(viewport={"width": 375, "height": 667})

        # Get the absolute path to the index.html file
        file_path = os.path.abspath('index.html')

        # Go to the local HTML file
        page.goto(f'file://{file_path}')

        # Wait for the page to load and take a screenshot
        page.wait_for_load_state('networkidle')
        page.screenshot(path='jules-scratch/verification/admin_panel_initial.png')

        # Find and click the toggle button
        toggle_btn = page.locator('.toggle-btn')
        expect(toggle_btn).to_be_visible()
        toggle_btn.click()

        # Wait for the sidebar to have the 'collapsed' class
        sidebar = page.locator('.sidebar')
        expect(sidebar).to_have_class('sidebar collapsed')
        page.screenshot(path='jules-scratch/verification/admin_panel_collapsed.png')

        browser.close()

if __name__ == "__main__":
    run()