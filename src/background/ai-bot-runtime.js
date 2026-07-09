// AI Bot alarm 同步和运行状态读取。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function clearAiBotAlarm() {
    return new Promise((resolve) => {
      if (!chrome.alarms?.clear) {
        resolve(false);
        return;
      }
      chrome.alarms.clear(AI_BOT_ALARM_NAME, () => {
        chrome.alarms.clear(AI_BOT_FEED_ALARM_NAME, () => {
          chrome.alarms.clear(AI_BOT_QUEUE_ALARM_NAME, resolve);
        });
      });
    });
  }

  function getAiBotAlarm(name) {
    return new Promise((resolve) => {
      if (!chrome.alarms?.get) {
        resolve(null);
        return;
      }
      chrome.alarms.get(name, (alarm) => resolve(alarm || null));
    });
  }

  async function createAiBotAlarm(name, alarmInfo, reset) {
    if (!chrome.alarms?.create) {
      return;
    }
    if (!reset && await getAiBotAlarm(name)) {
      return;
    }
    chrome.alarms.create(name, alarmInfo);
  }

  async function syncAiBotAlarm(options = {}) {
    const reset = options.reset === true;
    const settings = await readAiBotSettings();
    const consentAccepted = await hasAiBotConsent();
    if (reset) {
      await clearAiBotAlarm();
    }
    if (!consentAccepted || !settings.enabled || !chrome.alarms?.create) {
      await clearAiBotAlarm();
      return;
    }
    await createAiBotAlarm(AI_BOT_ALARM_NAME, {
      delayInMinutes: 0.1,
      periodInMinutes: Math.max(1, settings.pollMinutes)
    }, reset);
    if (settings.commentHomeFeed) {
      await createAiBotAlarm(AI_BOT_FEED_ALARM_NAME, {
        delayInMinutes: 0.15,
        periodInMinutes: Math.max(AI_BOT_MIN_FEED_POLL_MINUTES, settings.feedPollMinutes)
      }, reset);
    } else if (chrome.alarms?.clear) {
      chrome.alarms.clear(AI_BOT_FEED_ALARM_NAME);
    }
    await createAiBotAlarm(AI_BOT_QUEUE_ALARM_NAME, {
      delayInMinutes: 0.2,
      periodInMinutes: 0.5
    }, reset);
  }

  async function getAiBotStatus() {
    const settings = await readAiBotSettings();
    const apiParams = await refreshCachedApiParams();
    const queueStatus = await getQueueStatus();
    const feedCommentRecords = await readFeedCommentRecords();
    return {
      ok: true,
      enabled: settings.enabled,
      commentHomeFeed: settings.commentHomeFeed,
      running: aiBotRunning,
      queueProcessing: aiBotQueueProcessing,
      queueCount: queueStatus.count,
      feedCommentRecordsCount: Object.keys(feedCommentRecords).length,
      alarmName: AI_BOT_ALARM_NAME,
      queueAlarmName: AI_BOT_QUEUE_ALARM_NAME,
      hasCapturedApiParams: Object.keys(apiParams).length > 0,
      hasCapturedDeviceId: Boolean(apiParams.device_id),
      capturedApiParamKeys: Object.keys(apiParams)
    };
  }

