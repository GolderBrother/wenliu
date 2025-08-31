/**
 * 文流助手 - UI面板组件
 * 新架构简化版UI界面
 */
class wenliuPanel {
  constructor() {
    this.isVisible = false;
    this.panel = null;
    this.stylesLoaded = false;
  }

  /**
   * 初始化面板
   */
  init() {
    console.log('🎨 初始化文流面板...');
    this.loadStyles();
    this.createPanel();
    this.bindEvents();
    console.log('✅ 文流面板初始化完成');
  }

  /**
   * 加载样式
   */
  loadStyles() {
    if (this.stylesLoaded || document.getElementById('wenliu-panel-styles')) return;

    const style = document.createElement('style');
    style.id = 'wenliu-panel-styles';
    style.textContent = `
      :root {
        --wenliu-primary: #667eea;
        --wenliu-success: #52c41a;
        --wenliu-error: #ff4d4f;
        --wenliu-text-primary: #2d3436;
        --wenliu-text-light: #636e72;
        --wenliu-bg-primary: #ffffff;
        --wenliu-border: #e1e8ed;
        --wenliu-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      #wenliu-panel {
        position: fixed;
        top: 20px;
        right: -350px;
        width: 320px;
        background: var(--wenliu-bg-primary);
        border-radius: 12px;
        box-shadow: var(--wenliu-shadow);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        border: 1px solid var(--wenliu-border);
      }
      
      #wenliu-panel.visible {
        right: 20px;
      }
      
      .wenliu-panel-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 12px 16px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .wenliu-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .wenliu-panel-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }
      
      .wenliu-platform-info {
        font-size: 11px;
        opacity: 0.8;
        background: rgba(255, 255, 255, 0.15);
        padding: 2px 8px;
        border-radius: 12px;
      }
      
      .wenliu-close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      
      .wenliu-close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .wenliu-panel-content {
        padding: 16px;
        max-height: 500px;
        overflow-y: auto;
      }
      
      .wenliu-preset-section {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e1e8ed;
      }
      
      .wenliu-preset-label {
        font-size: 13px;
        color: #666;
        white-space: nowrap;
        margin: 0;
      }
      
      .wenliu-preset-selector {
        flex: 1;
        padding: 6px 10px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        background: white;
        font-size: 13px;
        outline: none;
      }
      
      .wenliu-preset-selector:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
      }
      
      .wenliu-status {
        text-align: center;
        padding: 20px;
        color: var(--wenliu-text-light);
      }
      
      .wenliu-status-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }
      
      .wenliu-toggle-btn {
        position: fixed;
        top: 50%;
        right: 20px;
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 50%;
        color: white;
        font-size: 20px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: var(--wenliu-shadow);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translateY(-50%);
      }
      
      .wenliu-toggle-btn:hover {
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }
    `;
    document.head.appendChild(style);
    this.stylesLoaded = true;
  }

  /**
   * 创建面板
   */
  createPanel() {
    // 创建切换按钮
    this.createToggleButton();
    
    // 创建主面板
    this.panel = document.createElement('div');
    this.panel.id = 'wenliu-panel';
    this.panel.innerHTML = `
      <div class="wenliu-panel-header">
        <div class="wenliu-header-left">
          <h3 class="wenliu-panel-title">文流助手</h3>
          <span class="wenliu-platform-info">${this.getCurrentPlatformName()}</span>
        </div>
        <button class="wenliu-close-btn" id="wenliu-close-btn">×</button>
      </div>
      <div class="wenliu-panel-content">
        <!-- 预设选择器 -->
        <div class="wenliu-preset-section">
          <label class="wenliu-preset-label">预设:</label>
          <select id="wenliu-preset-selector" class="wenliu-preset-selector">
            <option value="none">不使用预设</option>
          </select>
        </div>
        
        <div id="wenliu-content">
          <!-- 动态内容区域 -->
        </div>
      </div>
    `;
    
    document.body.appendChild(this.panel);
  }

  /**
   * 创建切换按钮
   */
  createToggleButton() {
    const existingBtn = document.getElementById('wenliu-toggle-btn');
    if (existingBtn) existingBtn.remove();

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'wenliu-toggle-btn';
    toggleBtn.className = 'wenliu-toggle-btn';
    toggleBtn.innerHTML = '字';
    toggleBtn.title = '打开文流助手';
    
    document.body.appendChild(toggleBtn);
    this.toggleBtn = toggleBtn;
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 切换按钮点击
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        this.toggle();
      });
    }

    // 关闭按钮点击
    const closeBtn = this.panel?.querySelector('#wenliu-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // 预设选择器变化
    const presetSelector = this.panel?.querySelector('#wenliu-preset-selector');
    if (presetSelector) {
      presetSelector.addEventListener('change', (e) => {
        if (window.wenliuFeatures && typeof window.wenliuFeatures.onPresetSelectorChange === 'function') {
          window.wenliuFeatures.onPresetSelectorChange(e);
        }
      });
    }

    // 点击面板外部关闭
    document.addEventListener('click', (e) => {
      if (this.isVisible && 
          this.panel && 
          !this.panel.contains(e.target) && 
          !this.toggleBtn?.contains(e.target)) {
        this.hide();
      }
    });

    // ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  /**
   * 显示面板
   */
  show() {
    if (!this.panel) return;
    
    this.panel.classList.add('visible');
    this.isVisible = true;
    
    // 发送事件通知
    wenliuEventBus.emit('panel:show');
  }

  /**
   * 隐藏面板
   */
  hide() {
    if (!this.panel) return;
    
    this.panel.classList.remove('visible');
    this.isVisible = false;
    
    // 发送事件通知
    wenliuEventBus.emit('panel:hide');
  }

  /**
   * 切换面板显示状态
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 获取当前平台名称
   */
  getCurrentPlatformName() {
    const app = window.wenliuApp;
    if (app?.currentPlatform) {
      return app.currentPlatform.displayName || '未知平台';
    }
    return '未检测到支持的平台';
  }

  /**
   * 更新面板内容（只更新动态内容区域，保留预设选择器等固定UI）
   */
  updateContent(content) {
    const contentEl = this.panel?.querySelector('#wenliu-content');
    if (contentEl) {
      contentEl.innerHTML = content;
    }
  }

  /**
   * 显示加载状态
   */
  showLoading(message = '加载中...') {
    this.updateContent(`
      <div class="wenliu-status">
        <div class="wenliu-status-icon">⏳</div>
        <div>${message}</div>
      </div>
    `);
  }

  /**
   * 显示错误状态
   */
  showError(error = '发生了错误') {
    this.updateContent(`
      <div class="wenliu-status">
        <div class="wenliu-status-icon">❌</div>
        <div>${error}</div>
      </div>
    `);
  }

  /**
   * 销毁面板
   */
  destroy() {
    this.panel?.remove();
    this.toggleBtn?.remove();
    const styles = document.getElementById('wenliu-panel-styles');
    styles?.remove();
  }
}

// 全局实例
window.wenliuPanel = new wenliuPanel();