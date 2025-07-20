import { Page } from '@playwright/test';

/**
 * Test utilities for Super User functionality
 */
export class SuperUserTestUtils {
    constructor(private page: Page) { }

    /**
     * Login as Super User
     */
    async loginAsSuperUser(): Promise<void> {
        await this.page.goto('/login');
        await this.page.fill('input[type="email"]', 'superuser@opencms.com');
        await this.page.fill('input[type="password"]', 'SuperUser123!');
        await this.page.click('button[type="submit"]');

        // Wait for successful login redirect
        await this.page.waitForURL(/dashboard|organizations|superuser/, { timeout: 10000 });
    }

    /**
     * Navigate to organization management
     */
    async navigateToOrganizations(): Promise<void> {
        await this.page.click('a[href*="organizations"], a:has-text("Organizations")');
        await this.page.waitForSelector('h1:has-text("Organization Management")', { timeout: 5000 });
    }

    /**
     * Navigate to audit logs
     */
    async navigateToAuditLogs(): Promise<void> {
        await this.page.click('a[href*="audit"], a:has-text("Audit")');
        await this.page.waitForSelector('h1', { timeout: 5000 });
    }

    /**
     * Navigate to system settings
     */
    async navigateToSystemSettings(): Promise<void> {
        await this.page.click('a[href*="settings"], a:has-text("System Settings")');
        await this.page.waitForSelector('h1', { timeout: 5000 });
    }

    /**
     * Create a test organization
     */
    async createTestOrganization(orgData: {
        name: string;
        domain: string;
        adminEmail: string;
        adminName: string;
    }): Promise<void> {
        await this.page.click('button:has-text("Add Organization")');

        const modal = this.page.locator('#addOrgModal, .modal:visible');
        await modal.waitFor({ state: 'visible' });

        await this.page.fill('input[name="organizationName"]', orgData.name);
        await this.page.fill('input[name="domain"]', orgData.domain);
        await this.page.fill('input[name="adminEmail"]', orgData.adminEmail);
        await this.page.fill('input[name="adminName"]', orgData.adminName);

        await this.page.click('button:has-text("Create Organization")');

        // Wait for success message or modal to close
        await this.page.waitForSelector('.alert-success, .toast-success', { timeout: 10000 });
    }

    /**
     * Delete a test organization (cleanup)
     */
    async deleteTestOrganization(organizationName: string): Promise<void> {
        // Find the organization row
        const orgRow = this.page.locator(`tbody tr:has-text("${organizationName}")`);

        if (await orgRow.isVisible()) {
            const deleteButton = orgRow.locator('a:has-text("Delete"), a:has-text("Remove"), button:has-text("Delete")');

            if (await deleteButton.isVisible()) {
                // Handle confirmation dialog
                this.page.on('dialog', dialog => dialog.accept());
                await deleteButton.click();

                // Wait for deletion to complete
                await this.page.waitForTimeout(1000);
            }
        }
    }

    /**
     * Apply audit log filters
     */
    async applyAuditFilters(filters: {
        organization?: string;
        actionType?: string;
        startDate?: string;
        endDate?: string;
        user?: string;
    }): Promise<void> {
        if (filters.organization) {
            await this.page.selectOption('select[name="organization"]', filters.organization);
        }

        if (filters.actionType) {
            await this.page.selectOption('select[name="actionType"]', filters.actionType);
        }

        if (filters.startDate) {
            await this.page.fill('input[name="startDate"]', filters.startDate);
        }

        if (filters.endDate) {
            await this.page.fill('input[name="endDate"]', filters.endDate);
        }

        if (filters.user) {
            await this.page.fill('input[name="user"]', filters.user);
        }

        await this.page.click('button:has-text("Filter"), button:has-text("Apply")');

        // Wait for filter results to load
        await this.page.waitForTimeout(1000);
    }

    /**
     * Generate a test report
     */
    async generateTestReport(reportType: string, metrics: string[]): Promise<void> {
        // Navigate to reporting if not already there
        const reportLink = this.page.locator('a:has-text("Report"), a:has-text("Analytics")');
        if (await reportLink.isVisible()) {
            await reportLink.click();
        }

        // Select report type
        const reportSelect = this.page.locator('select[name="reportType"]');
        if (await reportSelect.isVisible()) {
            await reportSelect.selectOption(reportType);
        }

        // Select metrics
        for (const metric of metrics) {
            const checkbox = this.page.locator(`input[value="${metric}"], input[name*="${metric.toLowerCase()}"]`);
            if (await checkbox.isVisible()) {
                await checkbox.check();
            }
        }

        // Generate report
        await this.page.click('button:has-text("Generate"), button:has-text("Create Report")');

        // Wait for report to generate
        await this.page.waitForSelector('.report-results, .chart-container, table', { timeout: 15000 });
    }

    /**
     * Update system configuration
     */
    async updateSystemConfig(section: string, settings: Record<string, any>): Promise<void> {
        // Navigate to the specific configuration section
        const sectionTab = this.page.locator(`a:has-text("${section}"), .tab:has-text("${section}")`);
        if (await sectionTab.isVisible()) {
            await sectionTab.click();
        }

        // Update settings
        for (const [key, value] of Object.entries(settings)) {
            const input = this.page.locator(`input[name="${key}"], select[name="${key}"], textarea[name="${key}"]`);

            if (await input.isVisible()) {
                const tagName = await input.evaluate(el => el.tagName.toLowerCase());
                const inputType = await input.evaluate(el => el.getAttribute('type'));

                if (tagName === 'select') {
                    await input.selectOption(value.toString());
                } else if (inputType === 'checkbox') {
                    if (value) {
                        await input.check();
                    } else {
                        await input.uncheck();
                    }
                } else {
                    await input.clear();
                    await input.fill(value.toString());
                }
            }
        }

        // Save configuration
        await this.page.click('button:has-text("Save"), button:has-text("Update")');

        // Wait for save confirmation
        await this.page.waitForSelector('.alert-success, .toast-success', { timeout: 10000 });
    }

    /**
     * Export data (CSV, PDF, etc.)
     */
    async exportData(format: 'csv' | 'pdf' | 'xlsx' = 'csv'): Promise<string> {
        const downloadPromise = this.page.waitForEvent('download');

        // Look for export button and click
        const exportButton = this.page.locator('button:has-text("Export"), a:has-text("Export"), button:has-text("Download")');
        await exportButton.click();

        // If there's a format selection, choose the specified format
        const formatOption = this.page.locator(`a:has-text("${format.toUpperCase()}"), button:has-text("${format.toUpperCase()}")`);
        if (await formatOption.isVisible()) {
            await formatOption.click();
        }

        const download = await downloadPromise;
        const filename = download.suggestedFilename();

        // Save the file for verification
        const path = await download.path();
        return path || '';
    }

    /**
     * Wait for page to load completely
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(500); // Additional buffer for dynamic content
    }

    /**
     * Check if element exists without waiting
     */
    async elementExists(selector: string): Promise<boolean> {
        try {
            return await this.page.locator(selector).isVisible();
        } catch {
            return false;
        }
    }

    /**
     * Get current user info from the page
     */
    async getCurrentUser(): Promise<{ name: string; role: string } | null> {
        const userInfo = this.page.locator('.user-info, .current-user, .navbar .user');

        if (await userInfo.isVisible()) {
            const name = await userInfo.locator('.user-name, [class*="name"]').textContent();
            const role = await userInfo.locator('.user-role, [class*="role"]').textContent();

            return {
                name: name?.trim() || '',
                role: role?.trim() || ''
            };
        }

        return null;
    }

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
        const logoutButton = this.page.locator('a:has-text("Logout"), button:has-text("Logout"), a:has-text("Sign Out")');

        if (await logoutButton.isVisible()) {
            await logoutButton.click();
            await this.page.waitForURL(/login|home/, { timeout: 10000 });
        }
    }

    /**
     * Clear all test data (for cleanup)
     */
    async clearTestData(): Promise<void> {
        // Remove any test organizations created during testing
        const testOrganizations = [
            'Test Corporation',
            'Network Test Corp',
            'Duplicate Corp',
            'Updated Corporation Name'
        ];

        for (const orgName of testOrganizations) {
            await this.deleteTestOrganization(orgName);
        }
    }
}

/**
 * Test data generators
 */
export class TestDataGenerator {
    static generateOrganization() {
        const timestamp = Date.now();
        return {
            name: `Test Org ${timestamp}`,
            domain: `testorg${timestamp}.com`,
            adminEmail: `admin${timestamp}@testorg.com`,
            adminName: `Test Admin ${timestamp}`
        };
    }

    static generateUser() {
        const timestamp = Date.now();
        return {
            name: `Test User ${timestamp}`,
            email: `user${timestamp}@test.com`,
            role: 'Investigator'
        };
    }

    static getDateRange(days: number) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }
}

/**
 * Common assertions for Super User tests
 */
export class SuperUserAssertions {
    constructor(private page: Page) { }

    async assertUserIsSuperUser(): Promise<void> {
        const userRole = this.page.locator('.user-role, [class*="role"]');
        if (await userRole.isVisible()) {
            const roleText = await userRole.textContent();
            if (!roleText?.toLowerCase().includes('super')) {
                throw new Error('Current user is not a Super User');
            }
        }
    }

    async assertOrganizationExists(organizationName: string): Promise<void> {
        const orgRow = this.page.locator(`tbody tr:has-text("${organizationName}")`);
        if (!(await orgRow.isVisible())) {
            throw new Error(`Organization "${organizationName}" not found`);
        }
    }

    async assertAuditLogEntry(action: string, user?: string, organization?: string): Promise<void> {
        const auditTable = this.page.locator('table.table, .audit-table');
        const auditRow = auditTable.locator(`tbody tr:has-text("${action}")`);

        if (!(await auditRow.isVisible())) {
            throw new Error(`Audit log entry for "${action}" not found`);
        }

        if (user) {
            if (!(await auditRow.locator(`:has-text("${user}")`).isVisible())) {
                throw new Error(`Audit log entry does not contain user "${user}"`);
            }
        }

        if (organization) {
            if (!(await auditRow.locator(`:has-text("${organization}")`).isVisible())) {
                throw new Error(`Audit log entry does not contain organization "${organization}"`);
            }
        }
    }
}
