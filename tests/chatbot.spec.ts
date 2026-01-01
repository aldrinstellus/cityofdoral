import { test, expect } from '@playwright/test';

test.describe('City of Doral Chatbot Widget', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page with the chatbot
    await page.goto('http://localhost:8888/Home/index.html');
    // Wait for widget to load
    await page.waitForSelector('.doral-chat-fab', { timeout: 10000 });
  });

  test.describe('FAB Button', () => {
    test('should be visible on page load', async ({ page }) => {
      const fab = page.locator('.doral-chat-fab');
      await expect(fab).toBeVisible();
    });

    test('should have correct aria-label', async ({ page }) => {
      const fab = page.locator('.doral-chat-fab');
      await expect(fab).toHaveAttribute('aria-label', 'Open chat');
    });

    test('should show chat icon initially', async ({ page }) => {
      const chatIcon = page.locator('.doral-chat-fab .doral-chat-icon');
      const closeIcon = page.locator('.doral-chat-fab .doral-close-icon');

      // Chat icon should be visible, close icon hidden
      await expect(chatIcon).toBeVisible();
      await expect(closeIcon).toBeHidden();
    });

    test('should open chat panel when clicked', async ({ page }) => {
      const fab = page.locator('.doral-chat-fab');
      const panel = page.locator('.doral-chat-panel');

      // Panel should be hidden initially
      await expect(panel).toBeHidden();

      // Click FAB
      await fab.click();

      // Panel should be visible
      await expect(panel).toBeVisible();
      await expect(fab).toHaveClass(/doral-chat-open/);
    });

    test('should toggle close icon when open', async ({ page }) => {
      const fab = page.locator('.doral-chat-fab');
      await fab.click();

      const closeIcon = page.locator('.doral-chat-fab .doral-close-icon');
      await expect(closeIcon).toBeVisible();
    });
  });

  test.describe('Chat Panel', () => {
    test.beforeEach(async ({ page }) => {
      // Open the chat
      await page.locator('.doral-chat-fab').click();
      await page.waitForSelector('.doral-chat-panel.doral-chat-visible');
    });

    test('should have header with title', async ({ page }) => {
      const title = page.locator('.doral-chat-title');
      await expect(title).toHaveText('City of Doral AI Assistant');
    });

    test('should have subtitle with online indicator', async ({ page }) => {
      const subtitle = page.locator('.doral-chat-subtitle');
      await expect(subtitle).toHaveText('Always here to help');
    });

    test('should have language toggle button', async ({ page }) => {
      const langBtn = page.locator('.doral-chat-lang-btn');
      await expect(langBtn).toBeVisible();
      await expect(langBtn).toContainText('EN');
    });

    test('should have clear chat button', async ({ page }) => {
      const clearBtn = page.locator('.doral-chat-clear-btn');
      await expect(clearBtn).toBeVisible();
    });

    test('should have close button', async ({ page }) => {
      const closeBtn = page.locator('.doral-chat-close-btn');
      await expect(closeBtn).toBeVisible();
    });

    test('should have welcome message', async ({ page }) => {
      const messages = page.locator('.doral-chat-messages');
      const welcomeMsg = messages.locator('.doral-chat-message.doral-assistant').first();
      await expect(welcomeMsg).toBeVisible();

      const bubble = welcomeMsg.locator('.doral-chat-bubble');
      await expect(bubble).toContainText("Hello! I'm the City of Doral AI Assistant");
    });

    test('should have quick actions section', async ({ page }) => {
      const quickActions = page.locator('.doral-chat-quick-actions');
      await expect(quickActions).toBeVisible();

      const actionBtns = page.locator('.doral-chat-quick-action-btn');
      const count = await actionBtns.count();
      expect(count).toBe(5); // 5 quick actions
    });

    test('should have suggestions section', async ({ page }) => {
      const suggestions = page.locator('.doral-chat-suggestions');
      await expect(suggestions).toBeVisible();

      const suggestionBtns = page.locator('.doral-chat-suggestion-btn');
      const count = await suggestionBtns.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('should have input field', async ({ page }) => {
      const input = page.locator('.doral-chat-input');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('placeholder', 'Type your question...');
    });

    test('should have send button (disabled initially)', async ({ page }) => {
      const sendBtn = page.locator('.doral-chat-send-btn');
      await expect(sendBtn).toBeVisible();
      await expect(sendBtn).toBeDisabled();
    });

    test('should have disclaimer text', async ({ page }) => {
      const disclaimer = page.locator('.doral-chat-disclaimer');
      await expect(disclaimer).toBeVisible();
      await expect(disclaimer).toContainText('Powered by AI');
    });
  });

  test.describe('Language Toggle', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('.doral-chat-fab').click();
      await page.waitForSelector('.doral-chat-panel.doral-chat-visible');
    });

    test('should switch to Spanish when clicked', async ({ page }) => {
      const langBtn = page.locator('.doral-chat-lang-btn');
      await langBtn.click();

      // Check language changed to ES
      await expect(langBtn).toContainText('ES');

      // Check title changed to Spanish
      const title = page.locator('.doral-chat-title');
      await expect(title).toHaveText('Asistente Virtual de la Ciudad de Doral');
    });

    test('should toggle back to English', async ({ page }) => {
      const langBtn = page.locator('.doral-chat-lang-btn');

      // Switch to Spanish
      await langBtn.click();
      await expect(langBtn).toContainText('ES');

      // Switch back to English
      await langBtn.click();
      await expect(langBtn).toContainText('EN');

      const title = page.locator('.doral-chat-title');
      await expect(title).toHaveText('City of Doral AI Assistant');
    });

    test('should update quick actions labels', async ({ page }) => {
      const langBtn = page.locator('.doral-chat-lang-btn');
      await langBtn.click();

      // Check Spanish quick action
      const firstAction = page.locator('.doral-chat-quick-action-btn').first();
      await expect(firstAction).toContainText('Reportar');
    });

    test('should update suggestions', async ({ page }) => {
      const langBtn = page.locator('.doral-chat-lang-btn');
      await langBtn.click();

      // Check Spanish suggestion
      const suggestions = page.locator('.doral-chat-suggestion-btn').first();
      await expect(suggestions).toContainText('horario');
    });
  });

  test.describe('Input & Send', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('.doral-chat-fab').click();
      await page.waitForSelector('.doral-chat-panel.doral-chat-visible');
    });

    test('should enable send button when typing', async ({ page }) => {
      const input = page.locator('.doral-chat-input');
      const sendBtn = page.locator('.doral-chat-send-btn');

      await expect(sendBtn).toBeDisabled();

      await input.fill('Hello');

      await expect(sendBtn).toBeEnabled();
    });

    test('should disable send button when input is cleared', async ({ page }) => {
      const input = page.locator('.doral-chat-input');
      const sendBtn = page.locator('.doral-chat-send-btn');

      await input.fill('Hello');
      await expect(sendBtn).toBeEnabled();

      await input.fill('');
      await expect(sendBtn).toBeDisabled();
    });

    test('should add user message when sent', async ({ page }) => {
      const input = page.locator('.doral-chat-input');
      const sendBtn = page.locator('.doral-chat-send-btn');

      await input.fill('Test message');
      await sendBtn.click();

      // Check user message appeared
      const userMsg = page.locator('.doral-chat-message.doral-user .doral-chat-bubble');
      await expect(userMsg.last()).toHaveText('Test message');
    });

    test('should show loading indicator after sending', async ({ page }) => {
      const input = page.locator('.doral-chat-input');
      const sendBtn = page.locator('.doral-chat-send-btn');

      await input.fill('What are the city hall hours?');
      await sendBtn.click();

      // Loading should appear
      const loading = page.locator('.doral-chat-loading-container');
      await expect(loading).toBeVisible({ timeout: 2000 });
    });

    test('should clear input after sending', async ({ page }) => {
      const input = page.locator('.doral-chat-input');
      const sendBtn = page.locator('.doral-chat-send-btn');

      await input.fill('Test');
      await sendBtn.click();

      await expect(input).toHaveValue('');
    });

    test('should hide suggestions after first message', async ({ page }) => {
      const input = page.locator('.doral-chat-input');
      const sendBtn = page.locator('.doral-chat-send-btn');
      const suggestions = page.locator('.doral-chat-suggestions');

      await expect(suggestions).toBeVisible();

      await input.fill('Hello');
      await sendBtn.click();

      await expect(suggestions).toBeHidden();
    });
  });

  test.describe('Quick Actions', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('.doral-chat-fab').click();
      await page.waitForSelector('.doral-chat-panel.doral-chat-visible');
    });

    test('should have 5 quick action buttons', async ({ page }) => {
      const actions = page.locator('.doral-chat-quick-action-btn');
      await expect(actions).toHaveCount(5);
    });

    test('should have icons in quick actions', async ({ page }) => {
      const icons = page.locator('.doral-action-icon');
      const count = await icons.count();
      expect(count).toBe(5);
    });

    test('should send query when quick action clicked', async ({ page }) => {
      const firstAction = page.locator('.doral-chat-quick-action-btn').first();
      await firstAction.click();

      // Check that a user message was sent
      const userMsg = page.locator('.doral-chat-message.doral-user');
      await expect(userMsg).toBeVisible();
    });
  });

  test.describe('Suggestions', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('.doral-chat-fab').click();
      await page.waitForSelector('.doral-chat-panel.doral-chat-visible');
    });

    test('should send query when suggestion clicked', async ({ page }) => {
      const firstSuggestion = page.locator('.doral-chat-suggestion-btn').first();
      const suggestionText = await firstSuggestion.textContent();

      await firstSuggestion.click();

      // Check that the suggestion text was sent
      const userMsg = page.locator('.doral-chat-message.doral-user .doral-chat-bubble').last();
      await expect(userMsg).toHaveText(suggestionText!);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('.doral-chat-fab').click();
      await page.waitForSelector('.doral-chat-panel.doral-chat-visible');
    });

    test('should close chat on Escape key', async ({ page }) => {
      const panel = page.locator('.doral-chat-panel');
      await expect(panel).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(panel).toBeHidden();
    });

    test('should toggle language on Ctrl+L', async ({ page }) => {
      const langBtn = page.locator('.doral-chat-lang-btn');
      await expect(langBtn).toContainText('EN');

      await page.keyboard.press('Control+l');

      await expect(langBtn).toContainText('ES');
    });

    test('should focus input when opened', async ({ page }) => {
      const input = page.locator('.doral-chat-input');
      await expect(input).toBeFocused();
    });

    test('should submit on Enter key', async ({ page }) => {
      const input = page.locator('.doral-chat-input');

      await input.fill('Test Enter submit');
      await page.keyboard.press('Enter');

      const userMsg = page.locator('.doral-chat-message.doral-user .doral-chat-bubble').last();
      await expect(userMsg).toHaveText('Test Enter submit');
    });
  });

  test.describe('Close Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('.doral-chat-fab').click();
      await page.waitForSelector('.doral-chat-panel.doral-chat-visible');
    });

    test('should close when close button clicked', async ({ page }) => {
      const closeBtn = page.locator('.doral-chat-close-btn');
      const panel = page.locator('.doral-chat-panel');

      await closeBtn.click();

      await expect(panel).toBeHidden();
    });

    test('should close when FAB clicked again', async ({ page }) => {
      const fab = page.locator('.doral-chat-fab');
      const panel = page.locator('.doral-chat-panel');

      await fab.click();

      await expect(panel).toBeHidden();
    });
  });

  test.describe('Clear Chat', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('.doral-chat-fab').click();
      await page.waitForSelector('.doral-chat-panel.doral-chat-visible');
    });

    test('should clear messages when clear button clicked', async ({ page }) => {
      // First send a message
      const input = page.locator('.doral-chat-input');
      await input.fill('Test message to clear');
      await page.keyboard.press('Enter');

      // Wait for user message
      await page.waitForSelector('.doral-chat-message.doral-user');

      // Click clear button
      const clearBtn = page.locator('.doral-chat-clear-btn');
      await clearBtn.click();

      // User messages should be gone, only welcome message remains
      const userMessages = page.locator('.doral-chat-message.doral-user');
      await expect(userMessages).toHaveCount(0);

      // Welcome message should be back
      const welcomeMsg = page.locator('.doral-chat-message.doral-assistant .doral-chat-bubble').first();
      await expect(welcomeMsg).toContainText("Hello! I'm the City of Doral AI Assistant");
    });

    test('should show suggestions again after clear', async ({ page }) => {
      // Send a message to hide suggestions
      const input = page.locator('.doral-chat-input');
      await input.fill('Hide suggestions');
      await page.keyboard.press('Enter');

      const suggestions = page.locator('.doral-chat-suggestions');
      await expect(suggestions).toBeHidden();

      // Clear chat
      const clearBtn = page.locator('.doral-chat-clear-btn');
      await clearBtn.click();

      // Suggestions should be visible again
      await expect(suggestions).toBeVisible();
    });
  });

  test.describe('Persistence', () => {
    test('should persist messages after page reload', async ({ page }) => {
      // Open chat and send a message
      await page.locator('.doral-chat-fab').click();
      await page.waitForSelector('.doral-chat-panel.doral-chat-visible');

      const input = page.locator('.doral-chat-input');
      await input.fill('Persistence test message');
      await page.keyboard.press('Enter');

      // Wait for message to appear
      await page.waitForSelector('.doral-chat-message.doral-user');

      // Reload page
      await page.reload();

      // Wait for widget to load
      await page.waitForSelector('.doral-chat-fab');

      // Open chat again
      await page.locator('.doral-chat-fab').click();
      await page.waitForSelector('.doral-chat-panel.doral-chat-visible');

      // Check message is still there
      const userMsg = page.locator('.doral-chat-message.doral-user .doral-chat-bubble');
      await expect(userMsg).toContainText('Persistence test message');
    });
  });

  test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('.doral-chat-fab').click();
      await page.waitForSelector('.doral-chat-panel.doral-chat-visible');
    });

    test('panel should have dialog role', async ({ page }) => {
      const panel = page.locator('.doral-chat-panel');
      await expect(panel).toHaveAttribute('role', 'dialog');
    });

    test('panel should have aria-modal', async ({ page }) => {
      const panel = page.locator('.doral-chat-panel');
      await expect(panel).toHaveAttribute('aria-modal', 'true');
    });

    test('messages area should have aria-live', async ({ page }) => {
      const messages = page.locator('.doral-chat-messages');
      await expect(messages).toHaveAttribute('aria-live', 'polite');
    });

    test('messages area should have log role', async ({ page }) => {
      const messages = page.locator('.doral-chat-messages');
      await expect(messages).toHaveAttribute('role', 'log');
    });

    test('FAB should have aria-expanded', async ({ page }) => {
      const fab = page.locator('.doral-chat-fab');
      await expect(fab).toHaveAttribute('aria-expanded', 'true');
    });

    test('input should have aria-label', async ({ page }) => {
      const input = page.locator('.doral-chat-input');
      await expect(input).toHaveAttribute('aria-label');
    });
  });

  test.describe('Visual Elements', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('.doral-chat-fab').click();
      await page.waitForSelector('.doral-chat-panel.doral-chat-visible');
    });

    test('should have bot avatar in header', async ({ page }) => {
      const avatar = page.locator('.doral-chat-header .doral-chat-avatar');
      await expect(avatar).toBeVisible();

      const svg = avatar.locator('svg');
      await expect(svg).toBeVisible();
    });

    test('should have bot avatar on assistant messages', async ({ page }) => {
      const msgAvatar = page.locator('.doral-chat-message.doral-assistant .doral-chat-message-avatar');
      await expect(msgAvatar.first()).toBeVisible();
    });

    test('should have timestamp on messages', async ({ page }) => {
      const timestamp = page.locator('.doral-chat-time').first();
      await expect(timestamp).toBeVisible();
    });

    test('should have date header', async ({ page }) => {
      const dateHeader = page.locator('.doral-chat-date-header');
      await expect(dateHeader.first()).toBeVisible();
      await expect(dateHeader.first()).toContainText(/Today|Yesterday|\w+/);
    });

    test('icons should be visible in quick actions', async ({ page }) => {
      const icons = page.locator('.doral-action-icon');
      const firstIcon = icons.first();
      await expect(firstIcon).toBeVisible();

      // Check it has emoji content
      const text = await firstIcon.textContent();
      expect(text?.length).toBeGreaterThan(0);
    });
  });
});
