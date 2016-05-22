namespace Game {
  export const gravity = 0.01;

  export let characterNames = Sup.get("In-Game/Characters", Sup.Folder).children;
  export let stageNames = Sup.get("In-Game/Stages", Sup.Folder).children;
  
  export const playerColors = [ new Sup.Color(1, 0.7, 0.7), new Sup.Color(0.7, 0.7, 1) ];
  export const playerLabelColors = [ new Sup.Color(1, 0.2, 0.2), new Sup.Color(0.2, 0.2, 1) ];
  export const playerCharIndices = [ 0, 1 ];
  export let stageIndice = 0;
  
  export const players: PlayerBehavior[] = [];
  export let camera: CameraBehavior;
  
  export let music: Sup.Audio.SoundPlayer;
  
  export function start() {
    players.length = 0;
    Sup.loadScene("In-Game/Scene");
    
    if (Game.music != null) Game.music.stop();
    Sup.setTimeout(1000, () => {
      Sup.Audio.playSound("In-Game/Fight");
      Game.music = Sup.Audio.playSound("In-Game/Music", 0.3, { loop: true });
    });
  }
}
