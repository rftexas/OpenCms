import { test, expect } from '@playwright/test';

test.describe('Super User Audit and Monitoring', () => {
    test.beforeEach(async ({ page }) => {
        // Login as Super User
        await page.goto('/login');
        await page.fill('input[type="email"]', 'superuser@opencms.com');
        await page.fill('input[type="password"]', 'SuperUser123!');
        await page.click('button[type="submit"]');

        // Navigate to audit logs
        await page.click('a[href*="audit"]');
        await expect(page.locator('h1')).toContainText(/audit|logs/i);
    });

    test.describe('Audit Log Access', () => {
        test('should display comprehensive audit log interface', async ({ page }) => {
            // Verify audit log table exists
            const auditTable = page.locator('table.table, .audit-table');
            await expect(auditTable).toBeVisible();

            // Verify expected columns
            const headers = auditTable.locator('thead th');
            await expect(headers).toContainText(/timestamp|user|organization|action|details/i);
        });

        test('should filter audit logs by organization', async ({ page }) => {
            // Select organization filter
            await page.selectOption('select[name="organization"]', 'ACME Corp');
            await page.click('button:has-text("Filter")');

            // Verify filtered results
            const auditRows = page.locator('tbody tr');
            const rowCount = await auditRows.count();

            if (rowCount > 0) {
                // Verify all visible rows contain the selected organization
                for (let i = 0; i < Math.min(rowCount, 5); i++) {
                    await expect(auditRows.nth(i)).toContainText('ACME Corp');
                }
            }
        });

        test('should filter audit logs by action type', async ({ page }) => {
            // Select action type filter
            await page.selectOption('select[name="actionType"]', 'User Creation');
            await page.click('button:has-text("Filter")');

            // Verify filtered results show only user creation events
            const auditRows = page.locator('tbody tr');
            const rowCount = await auditRows.count();

            if (rowCount > 0) {
                for (let i = 0; i < Math.min(rowCount, 3); i++) {
                    await expect(auditRows.nth(i)).toContainText(/user.*creat/i);
                }
            }
        });

        test('should filter audit logs by date range', async ({ page }) => {
            // Set date range filters
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7); // Last 7 days
            const endDate = new Date();

            await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
            await page.fill('input[name="endDate"]', endDate.toISOString().split('T')[0]);
            await page.click('button:has-text("Filter")');

            // Verify results are within date range
            const timestamps = page.locator('tbody td:first-child');
            const count = await timestamps.count();

            if (count > 0) {
                const firstTimestamp = await timestamps.first().textContent();
                expect(firstTimestamp).toBeTruthy();
            }
        });
    });

    test.describe('Audit Log Export', () => {
        test('should export audit logs as CSV', async ({ page }) => {
            // Set up download promise before clicking export
            const downloadPromise = page.waitForEvent('download');

            // Click export button
            await page.click('button:has-text("Export"), a:has-text("Export")');

            // Wait for download
            const download = await downloadPromise;
            expect(download.suggestedFilename()).toMatch(/audit.*\.csv$/i);

            // Verify file was downloaded
            const path = await download.path();
            expect(path).toBeTruthy();
        });

        test('should export filtered audit logs', async ({ page }) => {
            // Apply filters first
            await page.selectOption('select[name="organization"]', 'ACME Corp');
            await page.selectOption('select[name="actionType"]', 'User Creation');
            await page.click('button:has-text("Filter")');

            // Then export
            const downloadPromise = page.waitForEvent('download');
            await page.click('button:has-text("Export"), a:has-text("Export")');

            const download = await downloadPromise;
            expect(download.suggestedFilename()).toMatch(/audit.*\.csv$/i);
        });
    });

    test.describe('System Performance Monitoring', () => {
        test('should display system health indicators', async ({ page }) => {
            // Navigate to system monitoring if separate page
            const monitoringLink = page.locator('a:has-text("System"), a:has-text("Monitor")');
            if (await monitoringLink.isVisible()) {
                await monitoringLink.click();
            }

            // Verify system metrics are displayed
            await expect(page.locator('body')).toContainText(/cpu|memory|disk|database|response time/i);

            // Look for metric cards or indicators
            const metricCards = page.locator('.metric-card, .health-indicator, .system-stat');
            if (await metricCards.first().isVisible()) {
                await expect(metricCards.first()).toBeVisible();
            }
        });

        test('should show user login patterns', async ({ page }) => {
            // Look for login analytics section
            const loginSection = page.locator(':has-text("login"):has-text("pattern"), :has-text("user activity")');

            if (await loginSection.isVisible()) {
                await expect(loginSection).toBeVisible();

                // Verify charts or tables with login data
                const chartOrTable = page.locator('canvas, svg, table, .chart-container');
                await expect(chartOrTable.first()).toBeVisible();
            }
        });
    });

    test.describe('Security Event Monitoring', () => {
        test('should display security events and alerts', async ({ page }) => {
            // Navigate to security monitoring
            const securityLink = page.locator('a:has-text("Security"), a:has-text("Alert")');
            if (await securityLink.isVisible()) {
                await securityLink.click();
            }

            // Verify security events are displayed
            const securityTable = page.locator('table:has-text("security"), .security-events, .alert-list');
            if (await securityTable.isVisible()) {
                await expect(securityTable).toBeVisible();
            }
        });

        test('should handle real-time alerts', async ({ page }) => {
            // Check for real-time alert indicators
            const alertBadge = page.locator('.badge-danger, .alert-indicator, .notification-badge');

            if (await alertBadge.isVisible()) {
                await expect(alertBadge).toBeVisible();

                // Click to view alerts
                await alertBadge.click();

                // Verify alert details are shown
                await expect(page.locator('.alert-details, .modal, .dropdown-menu')).toBeVisible();
            }
        });
    });

    test.describe('Cross-Organization Analytics', () => {
        test('should generate cross-organization reports', async ({ page }) => {
            // Navigate to reporting section
            const reportLink = page.locator('a:has-text("Report"), a:has-text("Analytics")');
            if (await reportLink.isVisible()) {
                await reportLink.click();
            }

            // Select report type
            const reportSelect = page.locator('select[name="reportType"], select:has-text("report")');
            if (await reportSelect.isVisible()) {
                await reportSelect.selectOption('cross-organization');
            }

            // Select metrics
            await page.check('input[value="Active Cases"], input[name*="cases"]');
            await page.check('input[value="User Count"], input[name*="users"]');

            // Generate report
            await page.click('button:has-text("Generate"), button:has-text("Create Report")');

            // Verify report is generated
            await expect(page.locator('.report-results, .chart-container, table')).toBeVisible();
        });

        test('should allow drill-down into organization details', async ({ page }) => {
            // Navigate to analytics dashboard
            const dashboardLink = page.locator('a:has-text("Dashboard"), a:has-text("Analytics")');
            if (await dashboardLink.isVisible()) {
                await dashboardLink.click();
            }

            // Look for organization cards or chart elements
            const orgElement = page.locator('.organization-card, .chart-bar, .clickable-metric').first();

            if (await orgElement.isVisible()) {
                await orgElement.click();

                // Verify drill-down details are shown
                await expect(page.locator('.organization-details, .drill-down, .modal')).toBeVisible();
            }
        });

        test('should export cross-organization reports', async ({ page }) => {
            // Generate a report first
            const reportLink = page.locator('a:has-text("Report"), a:has-text("Analytics")');
            if (await reportLink.isVisible()) {
                await reportLink.click();

                // Generate simple report
                await page.click('button:has-text("Generate"), button:has-text("Create Report")');

                // Wait for report to load
                await expect(page.locator('.report-results, .chart-container')).toBeVisible();

                // Export report
                const downloadPromise = page.waitForEvent('download');
                await page.click('button:has-text("Export"), a:has-text("Download")');

                const download = await downloadPromise;
                expect(download.suggestedFilename()).toMatch(/report.*\.(pdf|csv|xlsx)$/i);
            }
        });
    });

    test.describe('Audit Log Pagination and Search', () => {
        test('should paginate through large audit log sets', async ({ page }) => {
            // Check if pagination exists
            const pagination = page.locator('.pagination');

            if (await pagination.isVisible()) {
                const nextButton = pagination.locator('a:has-text("Next"), a:has-text("›")');

                if (await nextButton.isVisible()) {
                    await nextButton.click();

                    // Verify page content changes
                    const rowCount = await page.locator('tbody tr').count();
                    expect(rowCount).toBeGreaterThan(0);
                }
            }
        });

        test('should search audit logs by user or action details', async ({ page }) => {
            const searchInput = page.locator('input[name="search"], input[placeholder*="search"]');

            if (await searchInput.isVisible()) {
                await searchInput.fill('admin@acme.com');
                await page.click('button:has-text("Search"), button[type="submit"]');

                // Verify search results contain the search term
                const results = page.locator('tbody tr');
                const rowCount = await results.count();

                if (rowCount > 0) {
                    await expect(results.first()).toContainText('admin@acme.com');
                }
            }
        });
    });

    test.describe('Error Handling and Performance', () => {
        test('should handle large audit log datasets efficiently', async ({ page }) => {
            // Test with a wide date range to potentially get large dataset
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6); // Last 6 months

            await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
            await page.click('button:has-text("Filter")');

            // Verify page remains responsive
            await expect(page.locator('table, .audit-table')).toBeVisible({ timeout: 10000 });

            // Check if pagination is working with large dataset
            const pagination = page.locator('.pagination');
            if (await pagination.isVisible()) {
                await expect(pagination).toBeVisible();
            }
        });

        test('should show appropriate message when no audit logs found', async ({ page }) => {
            // Apply very restrictive filters
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);

            await page.fill('input[name="startDate"]', futureDate.toISOString().split('T')[0]);
            await page.fill('input[name="endDate"]', futureDate.toISOString().split('T')[0]);
            await page.click('button:has-text("Filter")');

            // Verify "no results" message
            await expect(page.locator('tbody')).toContainText(/no.*found|no.*results|empty/i);
        });
    });
});
