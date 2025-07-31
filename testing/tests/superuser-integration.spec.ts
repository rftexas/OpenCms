import { test, expect } from '@playwright/test';
import { SuperUserTestUtils, TestDataGenerator, SuperUserAssertions } from './utils/superuser-test-utils';

test.describe('Super User Integration Tests', () => {
    let utils: SuperUserTestUtils;
    let assertions: SuperUserAssertions;
    let testOrganization: any;

    test.beforeEach(async ({ page }) => {
        utils = new SuperUserTestUtils(page);
        assertions = new SuperUserAssertions(page);
        testOrganization = TestDataGenerator.generateOrganization();

        // Login as Super User
        await utils.loginAsSuperUser();
        await assertions.assertUserIsSuperUser();
    });

    test.afterEach(async ({ page }) => {
        // Clean up test data
        await utils.clearTestData();
    });

    test.describe('Complete Organization Lifecycle', () => {
        test('should manage complete organization lifecycle from creation to deactivation', async ({ page }) => {
            // Step 1: Navigate to organization management
            await utils.navigateToOrganizations();

            // Step 2: Create new organization
            await utils.createTestOrganization(testOrganization);

            // Step 3: Verify organization appears in listing
            await assertions.assertOrganizationExists(testOrganization.name);

            // Step 4: Verify audit log entry for organization creation
            await utils.navigateToAuditLogs();
            await assertions.assertAuditLogEntry('Organization Created', undefined, testOrganization.name);

            // Step 5: Navigate back to organizations and edit
            await utils.navigateToOrganizations();

            const orgRow = page.locator(`tbody tr:has-text("${testOrganization.name}")`);
            await orgRow.locator('a:has-text("Edit")').click();

            const editModal = page.locator('#editOrgModal, .modal:visible');
            await editModal.waitFor({ state: 'visible' });

            // Update organization name
            const updatedName = `${testOrganization.name} - Updated`;
            await page.fill('input[name="organizationName"]', updatedName);
            await page.click('button:has-text("Save Changes")');

            // Step 6: Verify organization update
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();
            await assertions.assertOrganizationExists(updatedName);

            // Step 7: Change administrator
            await orgRow.locator('a:has-text("Edit")').click();
            await editModal.waitFor({ state: 'visible' });

            const newAdminEmail = 'newadmin@testorg.com';
            await page.fill('input[name="adminEmail"]', newAdminEmail);
            await page.click('button:has-text("Save Changes")');

            // Step 8: Verify admin change
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();
            await expect(page.locator('tbody')).toContainText(newAdminEmail);

            // Step 9: Verify audit trail for changes
            await utils.navigateToAuditLogs();
            await assertions.assertAuditLogEntry('Organization Updated', undefined, updatedName);
            await assertions.assertAuditLogEntry('Administrator Changed', undefined, updatedName);

            // Step 10: Deactivate organization
            await utils.navigateToOrganizations();
            const updatedOrgRow = page.locator(`tbody tr:has-text("${updatedName}")`);

            // Handle confirmation dialog
            page.on('dialog', async dialog => {
                expect(dialog.message()).toContain('deactivate');
                await dialog.accept();
            });

            await updatedOrgRow.locator('a:has-text("Deactivate")').click();

            // Step 11: Verify deactivation
            await expect(updatedOrgRow.locator('.badge')).toContainText('Inactive');

            // Step 12: Verify final audit entry
            await utils.navigateToAuditLogs();
            await assertions.assertAuditLogEntry('Organization Deactivated', undefined, updatedName);
        });
    });

    test.describe('Cross-Organization Reporting and Analytics', () => {
        test('should generate and export cross-organization reports', async ({ page }) => {
            // Step 1: Create multiple test organizations
            const org1 = TestDataGenerator.generateOrganization();
            const org2 = TestDataGenerator.generateOrganization();

            await utils.navigateToOrganizations();
            await utils.createTestOrganization(org1);
            await utils.createTestOrganization(org2);

            // Step 2: Generate cross-organization report
            await utils.generateTestReport('cross-organization', ['Active Cases', 'User Count']);

            // Step 3: Verify report contains both organizations
            await expect(page.locator('.report-results, .chart-container')).toBeVisible();
            await expect(page.locator('body')).toContainText(org1.name);
            await expect(page.locator('body')).toContainText(org2.name);

            // Step 4: Test drill-down functionality
            const orgElement = page.locator(`.organization-card:has-text("${org1.name}"), .chart-bar, .clickable-metric`).first();
            if (await orgElement.isVisible()) {
                await orgElement.click();
                await expect(page.locator('.organization-details, .drill-down, .modal')).toBeVisible();
            }

            // Step 5: Export report
            const exportPath = await utils.exportData('csv');
            expect(exportPath).toBeTruthy();

            // Step 6: Verify audit log for report generation
            await utils.navigateToAuditLogs();
            await assertions.assertAuditLogEntry('Report Generated');
        });
    });

    test.describe('Platform Configuration Management', () => {
        test('should configure platform-wide settings and verify impact', async ({ page }) => {
            // Step 1: Configure security settings
            await utils.navigateToSystemSettings();

            await utils.updateSystemConfig('Security', {
                sessionTimeout: '45',
                requireMFA: true,
                minPasswordLength: '10'
            });

            // Step 2: Configure notification templates
            await utils.updateSystemConfig('Notification', {
                templateType: 'welcome-email',
                emailSubject: 'Welcome to OpenCMS Platform',
                emailBody: 'Welcome {{userName}} to our enhanced Case Management System.'
            });

            // Step 3: Configure data retention policies
            await utils.updateSystemConfig('Data', {
                caseRetentionPeriod: '5-years',
                auditRetentionPeriod: '7-years',
                userRetentionPeriod: '3-years-after-deactivation'
            });

            // Step 4: Test external integrations
            await utils.updateSystemConfig('Integration', {
                enableSlackNotifications: true,
                slackBotToken: 'xoxb-test-integration-token',
                defaultSlackChannel: '#cms-notifications'
            });

            // Step 5: Verify configuration changes in audit log
            await utils.navigateToAuditLogs();
            await assertions.assertAuditLogEntry('System Configuration Updated');

            // Step 6: Test configuration rollback
            await utils.navigateToSystemSettings();

            // Look for restore/reset functionality
            const restoreButton = page.locator('button:has-text("Restore"), button:has-text("Reset")');
            if (await restoreButton.isVisible()) {
                page.on('dialog', async dialog => {
                    await dialog.accept();
                });

                await restoreButton.click();
                await expect(page.locator('.alert-success, .toast-success')).toBeVisible();
            }
        });
    });

    test.describe('Comprehensive Audit Trail', () => {
        test('should maintain complete audit trail across all Super User actions', async ({ page }) => {
            const testActions: Array<{ action: string; context: string }> = [];

            // Step 1: Perform various actions and track them

            // Organization creation
            await utils.navigateToOrganizations();
            await utils.createTestOrganization(testOrganization);
            testActions.push({ action: 'Organization Created', context: testOrganization.name });

            // Configuration change
            await utils.navigateToSystemSettings();
            await utils.updateSystemConfig('Security', { sessionTimeout: '60' });
            testActions.push({ action: 'System Configuration Updated', context: 'Security Settings' });

            // Audit log access
            await utils.navigateToAuditLogs();
            await utils.applyAuditFilters({ organization: testOrganization.name });
            testActions.push({ action: 'Audit Log Accessed', context: 'Filtered View' });

            // Report generation
            await utils.generateTestReport('system-overview', ['Total Organizations', 'System Health']);
            testActions.push({ action: 'Report Generated', context: 'System Overview' });

            // Step 2: Verify all actions are properly audited
            await utils.navigateToAuditLogs();

            // Clear any existing filters
            const clearButton = page.locator('button:has-text("Clear"), button:has-text("Reset")');
            if (await clearButton.isVisible()) {
                await clearButton.click();
            }

            // Verify each action appears in audit log
            for (const testAction of testActions) {
                await assertions.assertAuditLogEntry(testAction.action);
            }

            // Step 3: Test audit log export
            const auditExportPath = await utils.exportData('csv');
            expect(auditExportPath).toBeTruthy();

            // Step 4: Verify audit log filtering and search
            const dateRange = TestDataGenerator.getDateRange(1); // Last 24 hours
            await utils.applyAuditFilters({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                actionType: 'Organization Created'
            });

            // Verify filtered results
            const auditRows = page.locator('tbody tr');
            const rowCount = await auditRows.count();

            if (rowCount > 0) {
                // Verify all visible rows contain the filtered action type
                for (let i = 0; i < Math.min(rowCount, 3); i++) {
                    await expect(auditRows.nth(i)).toContainText(/organization.*creat/i);
                }
            }
        });
    });

    test.describe('Error Handling and Recovery', () => {
        test('should handle various error scenarios gracefully', async ({ page }) => {
            // Step 1: Test duplicate organization creation
            await utils.navigateToOrganizations();
            await utils.createTestOrganization(testOrganization);

            // Try to create organization with same domain
            await page.click('button:has-text("Add Organization")');
            const modal = page.locator('#addOrgModal, .modal:visible');
            await modal.waitFor({ state: 'visible' });

            const duplicateOrg = { ...testOrganization, name: 'Different Name' };
            await page.fill('input[name="organizationName"]', duplicateOrg.name);
            await page.fill('input[name="domain"]', duplicateOrg.domain);
            await page.fill('input[name="adminEmail"]', duplicateOrg.adminEmail);
            await page.fill('input[name="adminName"]', duplicateOrg.adminName);

            await page.click('button:has-text("Create Organization")');

            // Verify error message
            await expect(page.locator('.alert-danger, .toast-error')).toContainText(/domain.*exists|already.*registered/i);

            // Step 2: Test invalid configuration values
            await utils.navigateToSystemSettings();

            const securityTab = page.locator('a:has-text("Security"), .tab:has-text("Security")');
            if (await securityTab.isVisible()) {
                await securityTab.click();
            }

            // Try invalid session timeout
            const timeoutInput = page.locator('input[name="sessionTimeout"]');
            if (await timeoutInput.isVisible()) {
                await timeoutInput.clear();
                await timeoutInput.fill('-1');

                await page.click('button:has-text("Save"), button:has-text("Update")');

                // Verify validation error
                await expect(page.locator('.alert-danger, .invalid-feedback')).toBeVisible();
            }

            // Step 3: Test network error handling
            await page.route('**/api/organizations', route => route.abort());

            await utils.navigateToOrganizations();
            await page.click('button:has-text("Add Organization")');

            const networkTestOrg = TestDataGenerator.generateOrganization();
            await page.fill('input[name="organizationName"]', networkTestOrg.name);
            await page.fill('input[name="domain"]', networkTestOrg.domain);
            await page.fill('input[name="adminEmail"]', networkTestOrg.adminEmail);
            await page.fill('input[name="adminName"]', networkTestOrg.adminName);

            await page.click('button:has-text("Create Organization")');

            // Verify network error handling
            await expect(page.locator('.alert-danger, .toast-error')).toBeVisible();

            // Step 4: Verify error audit logging
            await page.unroute('**/api/organizations');
            await utils.navigateToAuditLogs();

            // Should have audit entries for failed operations
            await assertions.assertAuditLogEntry('Operation Failed');
        });
    });

    test.describe('Performance and Scalability', () => {
        test('should handle large datasets efficiently', async ({ page }) => {
            // Step 1: Test with large audit log dataset
            await utils.navigateToAuditLogs();

            // Apply wide date range filter
            const dateRange = TestDataGenerator.getDateRange(365); // Last year
            await utils.applyAuditFilters(dateRange);

            // Verify page remains responsive
            await expect(page.locator('table, .audit-table')).toBeVisible({ timeout: 15000 });

            // Step 2: Test pagination with large dataset
            const pagination = page.locator('.pagination');
            if (await pagination.isVisible()) {
                // Test navigation through multiple pages
                const pageLinks = pagination.locator('a').filter({ hasText: /^\d+$/ });
                const pageCount = await pageLinks.count();

                if (pageCount > 1) {
                    // Go to last page
                    await pageLinks.last().click();
                    await utils.waitForPageLoad();

                    // Verify content loaded
                    const rowCount = await page.locator('tbody tr').count();
                    expect(rowCount).toBeGreaterThan(0);

                    // Go back to first page
                    await pageLinks.first().click();
                    await utils.waitForPageLoad();
                }
            }

            // Step 3: Test export with large dataset
            const largExportPath = await utils.exportData('csv');
            expect(largExportPath).toBeTruthy();

            // Step 4: Test search performance
            const searchInput = page.locator('input[name="search"], input[placeholder*="search"]');
            if (await searchInput.isVisible()) {
                await searchInput.fill('admin');
                await page.click('button:has-text("Search")');

                // Verify search completes in reasonable time
                await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
            }
        });
    });
});
