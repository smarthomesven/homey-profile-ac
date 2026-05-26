const ProntohexDevice = require('../../lib/ProntohexDevice');

class AircoDevice extends ProntohexDevice {
  static SIGNAL_ID = 'airco';  
  static CAPABILITIES = {
    onoff: {
      'true': 'POWER',
      'false': 'POWER',
    },
    temp_up: 'UP',
    temp_down: 'DOWN',
    mode_cool: 'COOL',
    mode_dry: 'DRY',
    mode_fan: 'FAN',
    fan_low: 'LOW',
    fan_medium: 'MED',
    fan_high: 'HIGH',
    swing: 'SWING',
    timer: 'TIMER',
    units: 'UNIT',
  }

  async onInit() {
    await super.onInit();
    
    // Add any additional initialization here
    this.log('Airco device initialized');
    
    // Optional: You can also send commands directly
    // await this.sendCommand('row4_btn1');
    const setFanSpeedCard = this.homey.flow.getActionCard('set_fan_speed');
    setFanSpeedCard.registerRunListener(async (args, state) => {
      this.log('Setting fan speed to:', args.fan_speed);
      await this.sendCommand(`${args.speed.toUpperCase()}`);
      return true;
    });
    const setModeCard = this.homey.flow.getActionCard('set_mode');
    setModeCard.registerRunListener(async (args, state) => {
      this.log('Setting mode to:', args.mode);
      await this.sendCommand(`${args.mode.toUpperCase()}`);
      return true;
    });
    const swingCard = this.homey.flow.getActionCard('swing');
    swingCard.registerRunListener(async (args, state) => {
      await this.sendCommand(`SWING`);
      return true;
    });
    const timerCard = this.homey.flow.getActionCard('timer');
    timerCard.registerRunListener(async (args, state) => {
      await this.sendCommand('TIMER');
      return true;
    });
    const tempUpCard = this.homey.flow.getActionCard('temp_up');
    tempUpCard.registerRunListener(async (args, state) => {
      await this.sendCommand('UP');
      return true;
    });
    const tempDownCard = this.homey.flow.getActionCard('temp_down');
    tempDownCard.registerRunListener(async (args, state) => {
      await this.sendCommand('DOWN');
      return true;
    });
  }
}

module.exports = AircoDevice;