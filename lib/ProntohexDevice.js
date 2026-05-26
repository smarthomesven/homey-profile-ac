const Homey = require('homey');

/**
 * ProntohexDevice - Helper class for devices using Prontohex IR signals
 * Automatically registers capability listeners based on CAPABILITIES mapping
 */
class ProntohexDevice extends Homey.Device {
  /**
   * Define your capabilities mapping in your device class like this:
   * static CAPABILITIES = {
   *   onoff: {
   *     'true': 'POWER_ON',
   *     'false': 'POWER_OFF',
   *   },
   *   brightness_up: 'BRIGHTNESS_UP',
   *   volume_up: 'VOLUME_UP',
   * }
   */
  static CAPABILITIES = {};
  
  /**
   * Define your signal ID (must match the filename in .homeycompose/signals/ir/)
   * static SIGNAL_ID = 'my_signal';
   */
  static SIGNAL_ID = null;

  async onInit() {
    this.log('ProntohexDevice has been initialized');
    
    // Get the signal
    const signalId = this.constructor.SIGNAL_ID || this.getData().signalId;
    if (!signalId) {
      throw new Error('SIGNAL_ID not defined in device class');
    }
    
    this.signal = this.homey.rf.getSignalInfrared(signalId);
    
    // Register capability listeners
    await this.registerCapabilityListeners();
  }

  async registerCapabilityListeners() {
    const capabilities = this.constructor.CAPABILITIES;
    
    for (const [capability, cmdMapping] of Object.entries(capabilities)) {
      if (!this.hasCapability(capability)) {
        this.log(`Capability ${capability} not available, skipping`);
        continue;
      }

      // Handle boolean capabilities (like onoff)
      if (typeof cmdMapping === 'object' && !Array.isArray(cmdMapping)) {
        this.registerCapabilityListener(capability, async (value) => {
          const cmdName = cmdMapping[String(value)];
          if (!cmdName) {
            throw new Error(`No command mapped for ${capability}=${value}`);
          }
          this.log(`Sending command: ${cmdName} for ${capability}=${value}`);
          await this.signal.cmd(cmdName);
        });
      }
      // Handle button/action capabilities (like brightness_up)
      else if (typeof cmdMapping === 'string') {
        this.registerCapabilityListener(capability, async () => {
          this.log(`Sending command: ${cmdMapping} for ${capability}`);
          await this.signal.cmd(cmdMapping);
        });
      }
      // Handle numeric capabilities with value mapping
      else if (Array.isArray(cmdMapping)) {
        this.registerCapabilityListener(capability, async (value) => {
          // For array mappings, you can define ranges
          // e.g., [0, 'CMD_0'], [50, 'CMD_50'], [100, 'CMD_100']
          // Find closest match
          let closestCmd = cmdMapping[0][1];
          let closestDiff = Math.abs(value - cmdMapping[0][0]);
          
          for (const [threshold, cmdName] of cmdMapping) {
            const diff = Math.abs(value - threshold);
            if (diff < closestDiff) {
              closestDiff = diff;
              closestCmd = cmdName;
            }
          }
          
          this.log(`Sending command: ${closestCmd} for ${capability}=${value}`);
          await this.signal.cmd(closestCmd);
        });
      }
    }
  }

  /**
   * Send a raw command directly
   */
  async sendCommand(cmdName) {
    this.log(`Sending raw command: ${cmdName}`);
    await this.signal.cmd(cmdName);
  }
}

module.exports = ProntohexDevice;