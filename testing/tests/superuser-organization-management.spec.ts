import { test, expect } from '@playwright/test';

test.describe('Super User Organization Management', () => {
    // Setup and authentication
    test.beforeEach(async ({ page }) => {
        // Login as Super User before each test
        await page.goto('/login');
        await page.fill('input[type="email"]', 'superuser@opencms.com');
        await page.fill('input[type="password"]', 'SuperUser123!');
        await page.click('button[type="submit"]');

        // Wait for redirect to super user dashboard
        await expect(page).toHaveURL(/superuser|organizations/);

        // Navigate to organization management if not already there
        if (!page.url().includes('organizations')) {
            await page.click('a[href*="organizations"]');
        }

        await expect(page.locator('h1')).toContainText('Organization Management');
    });

    test.describe('Organization Listing and Filtering', () => {
        test('should display organization list with proper columns', async ({ page }) => {
            // Verify the organization table exists and has expected columns
            const table = page.locator('table.table');
            await expect(table).toBeVisible();

            const headers = table.locator('thead th');
            await expect(headers).toHaveCount(6);
            await expect(headers.nth(0)).toContainText('Name');
            await expect(headers.nth(1)).toContainText('Domain');
            await expect(headers.nth(2)).toContainText('Status');
            await expect(headers.nth(3)).toContainText('Created');
            await expect(headers.nth(4)).toContainText('Admin');
            await expect(headers.nth(5)).toContainText('Actions');
        });

        test('should filter organizations by status', async ({ page }) => {
            // Test filtering by Active status
            await page.selectOption('select:has-text("All")', 'Active');
            await page.click('button:has-text("Filter")');

            // Verify only active organizations are shown
            const statusBadges = page.locator('tbody .badge.bg-success');
            const count = await statusBadges.count();
            expect(count).toBeGreaterThan(0);

            // Verify all visible badges show "Active"
            for (let i = 0; i < count; i++) {
                await expect(statusBadges.nth(i)).toContainText('Active');
            }
        });

        test('should search organizations by name', async ({ page }) => {
            const searchInput = page.locator('input[placeholder*="Organization name"]');
            await searchInput.fill('ACME');
            await page.click('button:has-text("Filter")');

            // Verify search results contain ACME
            const organizationNames = page.locator('tbody td:first-child strong');
            const count = await organizationNames.count();

            if (count > 0) {
                for (let i = 0; i < count; i++) {
                    const text = await organizationNames.nth(i).textContent();
                    expect(text?.toLowerCase()).toContain('acme');
                }
            }
        });
    });

    test.describe('Organization Creation', () => {
        test('should create a new organization successfully', async ({ page }) => {
            // Click Add Organization button
            await page.click('button:has-text("Add Organization")');

            // Verify modal opens
            const modal = page.locator('#addOrgModal');
            await expect(modal).toBeVisible();

            // Fill in organization details
            await page.fill('input[name="organizationName"]', 'Test Corporation');
            await page.fill('input[name="domain"]', 'testcorp.com');
            await page.fill('input[name="adminEmail"]', 'admin@testcorp.com');
            await page.fill('input[name="adminName"]', 'Test Administrator');

            // Submit the form
            await page.click('button:has-text("Create Organization")');

            // Verify success message or redirect
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();

            // Verify new organization appears in the list
            await expect(page.locator('tbody')).toContainText('Test Corporation');
            await expect(page.locator('tbody')).toContainText('testcorp.com');
        });

        test('should validate required fields when creating organization', async ({ page }) => {
            await page.click('button:has-text("Add Organization")');

            const modal = page.locator('#addOrgModal');
            await expect(modal).toBeVisible();

            // Try to submit without filling required fields
            await page.click('button:has-text("Create Organization")');

            // Verify validation errors appear
            const errorMessages = page.locator('.invalid-feedback, .text-danger');
            await expect(errorMessages.first()).toBeVisible();
        });

        test('should prevent duplicate domain registration', async ({ page }) => {
            await page.click('button:has-text("Add Organization")');

            const modal = page.locator('#addOrgModal');
            await expect(modal).toBeVisible();

            // Try to create organization with existing domain
            await page.fill('input[name="organizationName"]', 'Duplicate Corp');
            await page.fill('input[name="domain"]', 'acme.com'); // Assuming this already exists
            await page.fill('input[name="adminEmail"]', 'admin@duplicate.com');
            await page.fill('input[name="adminName"]', 'Duplicate Admin');

            await page.click('button:has-text("Create Organization")');

            // Verify error message for duplicate domain
            await expect(page.locator('.alert-danger, .toast-error')).toContainText(/domain already exists|already registered/i);
        });
    });

    test.describe('Organization Editing', () => {
        test('should edit organization details successfully', async ({ page }) => {
            // Find an existing organization and click edit
            const firstEditButton = page.locator('tbody tr:first-child a:has-text("Edit")');
            await firstEditButton.click();

            // Verify edit modal opens
            const editModal = page.locator('#editOrgModal');
            await expect(editModal).toBeVisible();

            // Update organization name
            const nameInput = page.locator('input[name="organizationName"]');
            await nameInput.clear();
            await nameInput.fill('Updated Corporation Name');

            // Save changes
            await page.click('button:has-text("Save Changes")');

            // Verify success message
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();

            // Verify changes appear in the list
            await expect(page.locator('tbody')).toContainText('Updated Corporation Name');
        });

        test('should change organization administrator', async ({ page }) => {
            const firstEditButton = page.locator('tbody tr:first-child a:has-text("Edit")');
            await firstEditButton.click();

            const editModal = page.locator('#editOrgModal');
            await expect(editModal).toBeVisible();

            // Change administrator email
            const adminEmailInput = page.locator('input[name="adminEmail"]');
            await adminEmailInput.clear();
            await adminEmailInput.fill('newadmin@example.com');

            await page.click('button:has-text("Save Changes")');

            // Verify success message
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();

            // Verify new admin email appears in the list
            await expect(page.locator('tbody')).toContainText('newadmin@example.com');
        });
    });

    test.describe('Organization Deactivation', () => {
        test('should deactivate organization with confirmation', async ({ page }) => {
            // Find an active organization and click deactivate
            const activeRow = page.locator('tbody tr:has(.badge.bg-success)').first();
            const deactivateButton = activeRow.locator('a:has-text("Deactivate")');
            await deactivateButton.click();

            // Handle confirmation dialog
            page.on('dialog', async dialog => {
                expect(dialog.message()).toContain('deactivate');
                await dialog.accept();
            });

            // Verify status changes to Inactive
            await expect(activeRow.locator('.badge')).toContainText('Inactive');

            // Verify success message
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();
        });

        test('should cancel deactivation when user cancels confirmation', async ({ page }) => {
            const activeRow = page.locator('tbody tr:has(.badge.bg-success)').first();
            const originalStatus = await activeRow.locator('.badge').textContent();

            const deactivateButton = activeRow.locator('a:has-text("Deactivate")');
            await deactivateButton.click();

            // Cancel the confirmation dialog
            page.on('dialog', async dialog => {
                await dialog.dismiss();
            });

            // Verify status remains unchanged
            await expect(activeRow.locator('.badge')).toContainText(originalStatus || 'Active');
        });
    });

    test.describe('Organization Details View', () => {
        test('should view organization details', async ({ page }) => {
            // Click view button for first organization
            const firstViewButton = page.locator('tbody tr:first-child a:has-text("View")');
            await firstViewButton.click();

            // Verify navigation to organization details page or modal
            await expect(page.locator('h1, h2, .modal-title')).toContainText(/organization details|view organization/i);

            // Verify organization information is displayed
            await expect(page.locator('body')).toContainText(/name|domain|admin|status/i);
        });
    });

    test.describe('Bulk Operations', () => {
        test('should handle pagination when many organizations exist', async ({ page }) => {
            // Check if pagination exists
            const pagination = page.locator('.pagination');

            if (await pagination.isVisible()) {
                // Test navigation to second page
                await page.click('.pagination a:has-text("2"), .pagination a:has-text("Next")');

                // Verify URL or page content changes
                const rowCount = await page.locator('tbody tr').count();
                expect(rowCount).toBeGreaterThan(0);

                // Navigate back to first page
                await page.click('.pagination a:has-text("1"), .pagination a:has-text("Previous")');
            }
        });
    });

    test.describe('Responsive Design', () => {
        test('should display correctly on mobile devices', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });

            // Verify the page is still functional
            await expect(page.locator('h1')).toContainText('Organization Management');

            // Check if mobile-specific elements are visible
            const mobileMenu = page.locator('.navbar-toggler, .d-md-none');
            if (await mobileMenu.isVisible()) {
                await mobileMenu.click();
            }

            // Verify table is responsive (scrollable or stacked)
            const table = page.locator('table, .table-responsive');
            await expect(table).toBeVisible();
        });
    });

    test.describe('Error Handling', () => {
        test('should handle network errors gracefully', async ({ page }) => {
            // Simulate network failure during organization creation
            await page.route('**/api/organizations', route => route.abort());

            await page.click('button:has-text("Add Organization")');

            const modal = page.locator('#addOrgModal');
            await expect(modal).toBeVisible();

            await page.fill('input[name="organizationName"]', 'Network Test Corp');
            await page.fill('input[name="domain"]', 'networktest.com');
            await page.fill('input[name="adminEmail"]', 'admin@networktest.com');
            await page.fill('input[name="adminName"]', 'Network Admin');

            await page.click('button:has-text("Create Organization")');

            // Verify error message is displayed
            await expect(page.locator('.alert-danger, .toast-error')).toBeVisible();
        });

        test('should handle unauthorized access', async ({ page }) => {
            // Simulate session expiry or unauthorized access
            await page.route('**/api/organizations', route => {
                route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Unauthorized' })
                });
            });

            await page.reload();

            // Verify redirect to login or error message
            await expect(page).toHaveURL(/login|unauthorized/);
        });
    });
});
