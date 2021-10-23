import Phaser from 'phaser';
import config from './config';
import { RadarScene } from './scenes/RadarScene';
import { Preloader } from './scenes/Preloader';

new Phaser.Game({ ...config, scene: [Preloader, RadarScene] });
