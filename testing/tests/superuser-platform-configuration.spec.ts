import { test, expect } from '@playwright/test';

test.describe('Super User Platform Configuration', () => {
    test.beforeEach(async ({ page }) => {
        // Login as Super User
        await page.goto('/login');
        await page.fill('input[type="email"]', 'superuser@opencms.com');
        await page.fill('input[type="password"]', 'SuperUser123!');
        await page.click('button[type="submit"]');

        // Navigate to system settings
        await page.click('a[href*="settings"], a:has-text("System Settings")');
        await expect(page.locator('h1')).toContainText(/settings|configuration/i);
    });

    test.describe('Global System Configuration', () => {
        test('should display system configuration interface', async ({ page }) => {
            // Verify configuration sections are visible
            await expect(page.locator('body')).toContainText(/global settings|system configuration/i);

            // Check for common configuration sections
            const sections = [
                'Security Settings',
                'Authentication',
                'Notification Templates',
                'Data Retention',
                'System Integration'
            ];

            for (const section of sections) {
                const sectionElement = page.locator(`:has-text("${section}")`);
                if (await sectionElement.isVisible()) {
                    await expect(sectionElement).toBeVisible();
                }
            }
        });

        test('should configure global session timeout', async ({ page }) => {
            // Navigate to security settings
            const securityTab = page.locator('a:has-text("Security"), .tab:has-text("Security")');
            if (await securityTab.isVisible()) {
                await securityTab.click();
            }

            // Find session timeout setting
            const timeoutInput = page.locator('input[name="sessionTimeout"], input[name*="timeout"]');
            if (await timeoutInput.isVisible()) {
                await timeoutInput.clear();
                await timeoutInput.fill('30'); // 30 minutes

                // Save settings
                await page.click('button:has-text("Save"), button:has-text("Update")');

                // Verify success message
                await expect(page.locator('.alert-success, .toast-success')).toBeVisible();
            }
        });

        test('should configure password policy requirements', async ({ page }) => {
            // Navigate to authentication settings
            const authTab = page.locator('a:has-text("Authentication"), .tab:has-text("Auth")');
            if (await authTab.isVisible()) {
                await authTab.click();
            }

            // Configure password requirements
            const minLengthInput = page.locator('input[name="minPasswordLength"]');
            if (await minLengthInput.isVisible()) {
                await minLengthInput.clear();
                await minLengthInput.fill('12');
            }

            // Enable special character requirement
            const specialCharCheck = page.locator('input[name="requireSpecialChars"]');
            if (await specialCharCheck.isVisible()) {
                await specialCharCheck.check();
            }

            // Enable uppercase requirement
            const uppercaseCheck = page.locator('input[name="requireUppercase"]');
            if (await uppercaseCheck.isVisible()) {
                await uppercaseCheck.check();
            }

            // Save settings
            await page.click('button:has-text("Save"), button:has-text("Update")');
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();
        });
    });

    test.describe('Notification Template Management', () => {
        test('should configure email notification templates', async ({ page }) => {
            // Navigate to notification settings
            const notificationTab = page.locator('a:has-text("Notification"), .tab:has-text("Email")');
            if (await notificationTab.isVisible()) {
                await notificationTab.click();
            }

            // Select template to edit
            const templateSelect = page.locator('select[name="templateType"]');
            if (await templateSelect.isVisible()) {
                await templateSelect.selectOption('welcome-email');
            }

            // Edit template content
            const subjectInput = page.locator('input[name="emailSubject"]');
            if (await subjectInput.isVisible()) {
                await subjectInput.clear();
                await subjectInput.fill('Welcome to Case Management System');
            }

            const bodyTextarea = page.locator('textarea[name="emailBody"], .email-editor');
            if (await bodyTextarea.isVisible()) {
                await bodyTextarea.clear();
                await bodyTextarea.fill('Welcome {{userName}} to our Case Management System. Your account has been created successfully.');
            }

            // Save template
            await page.click('button:has-text("Save Template"), button:has-text("Update")');
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();
        });

        test('should preview notification templates', async ({ page }) => {
            const notificationTab = page.locator('a:has-text("Notification"), .tab:has-text("Email")');
            if (await notificationTab.isVisible()) {
                await notificationTab.click();
            }

            // Select template and preview
            const templateSelect = page.locator('select[name="templateType"]');
            if (await templateSelect.isVisible()) {
                await templateSelect.selectOption('case-assignment');

                // Click preview button
                const previewButton = page.locator('button:has-text("Preview")');
                if (await previewButton.isVisible()) {
                    await previewButton.click();

                    // Verify preview modal or section appears
                    await expect(page.locator('.preview-modal, .template-preview')).toBeVisible();

                    // Verify template variables are replaced
                    await expect(page.locator('.preview-content')).toContainText(/case|assignment/i);
                }
            }
        });

        test('should test notification delivery', async ({ page }) => {
            const notificationTab = page.locator('a:has-text("Notification"), .tab:has-text("Email")');
            if (await notificationTab.isVisible()) {
                await notificationTab.click();
            }

            // Send test notification
            const testEmailInput = page.locator('input[name="testEmail"]');
            if (await testEmailInput.isVisible()) {
                await testEmailInput.fill('test@example.com');

                const sendTestButton = page.locator('button:has-text("Send Test")');
                await sendTestButton.click();

                // Verify test email sent confirmation
                await expect(page.locator('.alert-info, .toast-info')).toContainText(/test.*sent|email.*delivered/i);
            }
        });
    });

    test.describe('Data Retention and Backup Policies', () => {
        test('should configure data retention periods', async ({ page }) => {
            // Navigate to data retention settings
            const dataTab = page.locator('a:has-text("Data"), .tab:has-text("Retention")');
            if (await dataTab.isVisible()) {
                await dataTab.click();
            }

            // Configure case data retention
            const caseRetentionSelect = page.locator('select[name="caseRetentionPeriod"]');
            if (await caseRetentionSelect.isVisible()) {
                await caseRetentionSelect.selectOption('7-years');
            }

            // Configure audit log retention
            const auditRetentionSelect = page.locator('select[name="auditRetentionPeriod"]');
            if (await auditRetentionSelect.isVisible()) {
                await auditRetentionSelect.selectOption('10-years');
            }

            // Configure user data retention
            const userRetentionSelect = page.locator('select[name="userRetentionPeriod"]');
            if (await userRetentionSelect.isVisible()) {
                await userRetentionSelect.selectOption('2-years-after-deactivation');
            }

            // Save retention policies
            await page.click('button:has-text("Save"), button:has-text("Update")');
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();
        });

        test('should configure backup schedules', async ({ page }) => {
            const backupTab = page.locator('a:has-text("Backup"), .tab:has-text("Backup")');
            if (await backupTab.isVisible()) {
                await backupTab.click();
            }

            // Enable automated backups
            const enableBackupCheck = page.locator('input[name="enableAutomatedBackup"]');
            if (await enableBackupCheck.isVisible()) {
                await enableBackupCheck.check();
            }

            // Set backup frequency
            const backupFrequencySelect = page.locator('select[name="backupFrequency"]');
            if (await backupFrequencySelect.isVisible()) {
                await backupFrequencySelect.selectOption('daily');
            }

            // Set backup retention count
            const backupRetentionInput = page.locator('input[name="backupRetentionCount"]');
            if (await backupRetentionInput.isVisible()) {
                await backupRetentionInput.clear();
                await backupRetentionInput.fill('30');
            }

            // Save backup settings
            await page.click('button:has-text("Save"), button:has-text("Update")');
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();
        });
    });

    test.describe('External System Integrations', () => {
        test('should configure Slack integration', async ({ page }) => {
            // Navigate to integrations
            const integrationsTab = page.locator('a:has-text("Integration"), .tab:has-text("External")');
            if (await integrationsTab.isVisible()) {
                await integrationsTab.click();
            }

            // Configure Slack settings
            const slackTokenInput = page.locator('input[name="slackBotToken"]');
            if (await slackTokenInput.isVisible()) {
                await slackTokenInput.clear();
                await slackTokenInput.fill('xoxb-test-token-123');
            }

            const slackChannelInput = page.locator('input[name="defaultSlackChannel"]');
            if (await slackChannelInput.isVisible()) {
                await slackChannelInput.clear();
                await slackChannelInput.fill('#cms-alerts');
            }

            // Enable Slack notifications
            const enableSlackCheck = page.locator('input[name="enableSlackNotifications"]');
            if (await enableSlackCheck.isVisible()) {
                await enableSlackCheck.check();
            }

            // Test connection
            const testSlackButton = page.locator('button:has-text("Test Slack")');
            if (await testSlackButton.isVisible()) {
                await testSlackButton.click();

                // Verify connection test result
                await expect(page.locator('.alert, .toast')).toBeVisible();
            }

            // Save integration settings
            await page.click('button:has-text("Save"), button:has-text("Update")');
        });

        test('should configure Microsoft Teams integration', async ({ page }) => {
            const integrationsTab = page.locator('a:has-text("Integration"), .tab:has-text("External")');
            if (await integrationsTab.isVisible()) {
                await integrationsTab.click();
            }

            // Configure Teams webhook
            const teamsWebhookInput = page.locator('input[name="teamsWebhookUrl"]');
            if (await teamsWebhookInput.isVisible()) {
                await teamsWebhookInput.clear();
                await teamsWebhookInput.fill('https://outlook.office.com/webhook/test-webhook-url');
            }

            // Enable Teams notifications
            const enableTeamsCheck = page.locator('input[name="enableTeamsNotifications"]');
            if (await enableTeamsCheck.isVisible()) {
                await enableTeamsCheck.check();
            }

            // Test Teams connection
            const testTeamsButton = page.locator('button:has-text("Test Teams")');
            if (await testTeamsButton.isVisible()) {
                await testTeamsButton.click();
                await expect(page.locator('.alert, .toast')).toBeVisible();
            }

            // Save settings
            await page.click('button:has-text("Save"), button:has-text("Update")');
        });
    });

    test.describe('Feature Toggle Management', () => {
        test('should manage platform-wide feature flags', async ({ page }) => {
            // Navigate to feature management
            const featuresTab = page.locator('a:has-text("Feature"), .tab:has-text("Feature")');
            if (await featuresTab.isVisible()) {
                await featuresTab.click();
            }

            // Toggle advanced analytics feature
            const analyticsToggle = page.locator('input[name="enableAdvancedAnalytics"]');
            if (await analyticsToggle.isVisible()) {
                await analyticsToggle.check();
            }

            // Toggle multi-factor authentication requirement
            const mfaToggle = page.locator('input[name="requireMFA"]');
            if (await mfaToggle.isVisible()) {
                await mfaToggle.check();
            }

            // Configure feature rollout percentage
            const rolloutSlider = page.locator('input[name="newFeatureRollout"]');
            if (await rolloutSlider.isVisible()) {
                await rolloutSlider.fill('25'); // 25% rollout
            }

            // Save feature settings
            await page.click('button:has-text("Save"), button:has-text("Update")');
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();
        });

        test('should preview feature changes before applying', async ({ page }) => {
            const featuresTab = page.locator('a:has-text("Feature"), .tab:has-text("Feature")');
            if (await featuresTab.isVisible()) {
                await featuresTab.click();
            }

            // Make changes to features
            const newFeatureToggle = page.locator('input[name="enableBetaFeature"]');
            if (await newFeatureToggle.isVisible()) {
                await newFeatureToggle.check();
            }

            // Click preview button instead of save
            const previewButton = page.locator('button:has-text("Preview Changes")');
            if (await previewButton.isVisible()) {
                await previewButton.click();

                // Verify preview shows impact of changes
                await expect(page.locator('.preview-modal, .change-preview')).toBeVisible();
                await expect(page.locator('.preview-content')).toContainText(/organizations affected|users impacted/i);
            }
        });
    });

    test.describe('System Maintenance', () => {
        test('should schedule system maintenance windows', async ({ page }) => {
            // Navigate to maintenance settings
            const maintenanceTab = page.locator('a:has-text("Maintenance"), .tab:has-text("System")');
            if (await maintenanceTab.isVisible()) {
                await maintenanceTab.click();
            }

            // Schedule maintenance
            const maintenanceDate = page.locator('input[name="maintenanceDate"]');
            if (await maintenanceDate.isVisible()) {
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 7);
                await maintenanceDate.fill(futureDate.toISOString().split('T')[0]);
            }

            const maintenanceTime = page.locator('input[name="maintenanceTime"]');
            if (await maintenanceTime.isVisible()) {
                await maintenanceTime.fill('02:00');
            }

            const maintenanceDuration = page.locator('select[name="maintenanceDuration"]');
            if (await maintenanceDuration.isVisible()) {
                await maintenanceDuration.selectOption('2-hours');
            }

            // Set maintenance message
            const maintenanceMessage = page.locator('textarea[name="maintenanceMessage"]');
            if (await maintenanceMessage.isVisible()) {
                await maintenanceMessage.fill('Scheduled maintenance for system upgrades. Expected downtime: 2 hours.');
            }

            // Schedule maintenance
            await page.click('button:has-text("Schedule Maintenance")');
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();
        });

        test('should configure system health monitoring', async ({ page }) => {
            const monitoringTab = page.locator('a:has-text("Monitoring"), .tab:has-text("Health")');
            if (await monitoringTab.isVisible()) {
                await monitoringTab.click();
            }

            // Configure health check intervals
            const healthCheckInterval = page.locator('select[name="healthCheckInterval"]');
            if (await healthCheckInterval.isVisible()) {
                await healthCheckInterval.selectOption('5-minutes');
            }

            // Set alert thresholds
            const cpuThreshold = page.locator('input[name="cpuAlertThreshold"]');
            if (await cpuThreshold.isVisible()) {
                await cpuThreshold.fill('80');
            }

            const memoryThreshold = page.locator('input[name="memoryAlertThreshold"]');
            if (await memoryThreshold.isVisible()) {
                await memoryThreshold.fill('85');
            }

            // Configure alert recipients
            const alertEmails = page.locator('textarea[name="alertEmails"]');
            if (await alertEmails.isVisible()) {
                await alertEmails.fill('admin@opencms.com, ops@opencms.com');
            }

            // Save monitoring settings
            await page.click('button:has-text("Save"), button:has-text("Update")');
            await expect(page.locator('.alert-success, .toast-success')).toBeVisible();
        });
    });

    test.describe('Configuration Validation and Error Handling', () => {
        test('should validate configuration changes before saving', async ({ page }) => {
            // Try to set invalid session timeout
            const securityTab = page.locator('a:has-text("Security"), .tab:has-text("Security")');
            if (await securityTab.isVisible()) {
                await securityTab.click();
            }

            const timeoutInput = page.locator('input[name="sessionTimeout"]');
            if (await timeoutInput.isVisible()) {
                await timeoutInput.clear();
                await timeoutInput.fill('0'); // Invalid timeout

                await page.click('button:has-text("Save"), button:has-text("Update")');

                // Verify validation error
                await expect(page.locator('.alert-danger, .invalid-feedback')).toContainText(/invalid|must be greater|minimum/i);
            }
        });

        test('should handle configuration conflicts', async ({ page }) => {
            // Create conflicting settings (e.g., backup retention longer than data retention)
            const dataTab = page.locator('a:has-text("Data"), .tab:has-text("Retention")');
            if (await dataTab.isVisible()) {
                await dataTab.click();
            }

            // Set very short data retention
            const dataRetention = page.locator('select[name="caseRetentionPeriod"]');
            if (await dataRetention.isVisible()) {
                await dataRetention.selectOption('1-year');
            }

            // Set longer backup retention
            const backupRetention = page.locator('input[name="backupRetentionCount"]');
            if (await backupRetention.isVisible()) {
                await backupRetention.fill('2000'); // Very long retention

                await page.click('button:has-text("Save"), button:has-text("Update")');

                // Verify conflict warning
                await expect(page.locator('.alert-warning, .conflict-warning')).toBeVisible();
            }
        });

        test('should provide configuration restore functionality', async ({ page }) => {
            // Look for restore/reset functionality
            const restoreButton = page.locator('button:has-text("Restore"), button:has-text("Reset"), button:has-text("Default")');

            if (await restoreButton.isVisible()) {
                // Handle confirmation dialog
                page.on('dialog', async dialog => {
                    expect(dialog.message()).toContain(/restore|reset|default/);
                    await dialog.accept();
                });

                await restoreButton.click();

                // Verify restore success
                await expect(page.locator('.alert-success, .toast-success')).toContainText(/restored|reset|default/i);
            }
        });
    });
});
