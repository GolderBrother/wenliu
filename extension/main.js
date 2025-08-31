/**
 * 文流助手 - 新架构主入口文件
 * 基于插件化的可扩展架构
 */
(function() {
  'use strict';

  console.log('🚀 文流助手启动 - 新架构版本');

  /**
   * 模块加载器 - 负责按正确顺序加载所有必需模块
   */
  const ModuleLoader = {
    // 核心模块列表（按依赖顺序）
    coreModules: [
      'wenliuEventBus',           // 事件总线
      'wenliuConfigService',      // 配置服务
      'wenliuApiService',         // API服务
      'wenliuUtilsService',       // 工具服务
      'wenliuContentService',     // 内容处理服务
      'wenliuPluginConfig',       // 插件配置
      'wenliuPlatformDetector',   // 平台检测工具
      'wenliuPlatformManager',    // 平台管理服务
      'wenliuPlatformRegistry',   // 平台注册中心
      'wenliuPluginManager',      // 插件管理器
      'BasePlatformPlugin',      // 基础平台插件类
      'wenliuApp'                 // 核心应用
    ],

    // 已移除旧系统模块，新架构不再需要

    loadedModules: new Set(),

    /**
     * 检查模块是否已加载
     */
    isModuleLoaded(moduleName) {
      const isLoaded = typeof window[moduleName] !== 'undefined';
      if (isLoaded) {
        this.loadedModules.add(moduleName);
      }
      return isLoaded;
    },

    /**
     * 等待核心模块加载完成
     */
    async waitForCoreModules(maxWaitTime = 10000) {
      console.log('⏳ 等待核心模块加载...');
      const startTime = Date.now();
      
      return new Promise((resolve, reject) => {
        const checkModules = () => {
          const missingModules = this.coreModules.filter(module => 
            !this.isModuleLoaded(module)
          );

          if (missingModules.length === 0) {
            console.log('✅ 核心模块加载完成');
            resolve();
            return;
          }

          if (Date.now() - startTime >= maxWaitTime) {
            console.warn('⏰ 核心模块加载超时，缺失:', missingModules);
            // 不完全拒绝，尝试继续运行
            resolve();
            return;
          }

          setTimeout(checkModules, 100);
        };

        checkModules();
      });
    },


    /**
     * 初始化核心服务
     */
    async initServices() {
      console.log('🔧 初始化核心服务...');
      
      // 初始化配置服务
      if (window.wenliuConfigService) {
        await window.wenliuConfigService.init();
      }
      
      // 初始化API服务
      if (window.wenliuApiService) {
        await window.wenliuApiService.init();
      }
      
      // 初始化工具服务
      if (window.wenliuUtilsService) {
        window.wenliuUtilsService.init();
      }
      
      console.log('✅ 核心服务初始化完成');
    }
  };

  /**
   * 应用初始化管理器
   */
  const AppInitializer = {
    initialized: false,

    /**
     * 主初始化流程
     */
    async initialize() {
      if (this.initialized) {
        console.log('⚠️ 应用已初始化');
        return;
      }

      try {
        console.log('🎯 开始初始化文流助手...');

        // 1. 等待核心模块
        await ModuleLoader.waitForCoreModules();

        // 2. 初始化核心服务
        await ModuleLoader.initServices();

        // 3. 初始化应用
        if (window.wenliuApp) {
          await window.wenliuApp.init();
          this.initialized = true;
          console.log('✅ 新架构初始化完成');
        } else {
          throw new Error('wenliuApp核心模块未找到');
        }

        // 4. 设置消息监听器
        this.setupMessageHandlers();

        console.log('🎉 文流助手初始化完成');

      } catch (error) {
        console.error('❌ 初始化失败:', error);
        throw error;
      }
    },


    /**
     * 设置消息处理器
     */
    setupMessageHandlers() {
      // Chrome消息监听器
      if (chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
          console.log('📨 收到外部消息:', request.action);
          
          try {
            let result;
            
            if (window.wenliuApp && window.wenliuApp.isInitialized) {
              // 使用新系统处理
              result = await window.wenliuApp.handleMessage(request);
            } else {
              result = { success: false, error: '系统未就绪' };
            }
            
            sendResponse(result);
          } catch (error) {
            console.error('消息处理失败:', error);
            sendResponse({ success: false, error: error.message });
          }
        });
      }

      // 配置更新监听器
      if (chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
          if (message.action === 'configUpdated') {
            console.log('文流助手: 配置已更新', message.config);
            if (window.wenliuConfigService && message.config.apiBaseUrl) {
              window.wenliuConfigService.setApiBaseUrl(message.config.apiBaseUrl);
            }
          }
        });
      }
    },

  };

  /**
   * 页面准备检查器
   */
  const PageReadyChecker = {
    /**
     * 等待页面准备就绪
     */
    waitForPageReady() {
      return new Promise((resolve) => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', resolve);
        } else {
          resolve();
        }
      });
    },

    /**
     * 延迟初始化（给页面时间加载动态内容）
     */
    async delayedInitialize() {
      await this.waitForPageReady();
      
      // 额外延迟以确保动态内容加载
      const delay = this.getInitDelay();
      if (delay > 0) {
        console.log(`⏱️ 延迟 ${delay}ms 等待页面完全加载`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return AppInitializer.initialize();
    },

    /**
     * 获取初始化延迟时间（基于平台配置）
     */
    getInitDelay() {
      const url = window.location.href;
      
      // 使用平台配置中的延迟设置
      if (window.wenliuPluginConfig) {
        const matchedPlatforms = window.wenliuPluginConfig.getPluginsForUrl(url);
        if (matchedPlatforms.length > 0) {
          const platform = matchedPlatforms[0];
          return platform.specialHandling?.initDelay || platform.loadDelay || 1000;
        }
      }
      
      return 1000; // 默认延迟
    }
  };

  // 新架构通过服务模块自动初始化，无需手动调用

  // 启动应用
  PageReadyChecker.delayedInitialize().then(() => {
    // 检查是否有需要延迟重试的平台
    const url = window.location.href;
    if (window.wenliuPluginConfig) {
      const matchedPlatforms = window.wenliuPluginConfig.getPluginsForUrl(url);
      const platform = matchedPlatforms.find(p => p.specialHandling?.retryOnFail);
      
      if (platform) {
        const retryDelay = platform.specialHandling.retryDelay || 3000;
        setTimeout(async () => {
          console.log(`🔄 ${platform.displayName}平台延迟重试...`);
          
          // 检查是否需要重新初始化
          if (window.wenliuApp && window.wenliuApp.currentPlatform === null) {
            try {
              await window.wenliuApp.detectAndLoadPlatform();
              console.log(`✅ ${platform.displayName}平台延迟初始化成功`);
            } catch (error) {
              console.warn(`${platform.displayName}平台延迟初始化失败:`, error);
            }
          }
        }, retryDelay);
      }
    }
  }).catch(error => {
    console.error('❌ 应用启动失败:', error);
  });

  // 导出到全局作用域（用于调试）
  if (typeof window !== 'undefined') {
    window.wenliuModuleLoader = ModuleLoader;
    window.wenliuAppInitializer = AppInitializer;
    window.wenliuPageReadyChecker = PageReadyChecker;
  }

  console.log('✅ 文流助手主控制器已加载 - 新架构版本');
})();