class StageSelectMenuBehavior extends Sup.Behavior {
  private selectActor: Sup.Actor;
  private offset = (-StageSelectMenuBehavior.charsPerRow + 1) * StageSelectMenuBehavior.spaceBetween / 2;

  awake() {
    const stagesActor = Sup.getActor("Stages");

    this.selectActor = Sup.getActor("Select");
    
    for (let i = 0; i < Game.stageNames.length; i++) {
      const name = Game.stageNames[i];
      const stageActor = new Sup.Actor("Stage", stagesActor);
      new Sup.SpriteRenderer(stageActor, `In-Game/Stages/${name}/Preview`);
      // stageActor.setLocalScale(1);
      
      const x = i % StageSelectMenuBehavior.charsPerRow;
      const y = Math.floor(i / StageSelectMenuBehavior.charsPerRow);
      stageActor.setLocalPosition(
        this.offset + x * StageSelectMenuBehavior.spaceBetween,
        -y * StageSelectMenuBehavior.spaceBetween, 1);
    }
    
    this.setStageIndex(Game.stageIndice, false);
  }

  update() {
    // Menu
    if (Sup.Input.wasKeyJustPressed("ESCAPE") || Sup.Input.wasGamepadButtonJustPressed(0, 8)) {
      Sup.loadScene("Character Select Menu/Scene");
    }

    if (Sup.Input.wasKeyJustPressed("LEFT") || Sup.Input.wasKeyJustPressed("Q") || Sup.Input.wasGamepadAxisJustPressed(0, 0, false)) this.setStageIndex(Game.stageIndice - 1);
    if (Sup.Input.wasKeyJustPressed("RIGHT") || Sup.Input.wasKeyJustPressed("D") || Sup.Input.wasGamepadAxisJustPressed(0, 0, true)) this.setStageIndex(Game.stageIndice + 1);
    if (Sup.Input.wasKeyJustPressed("UP") || Sup.Input.wasKeyJustPressed("Z") || Sup.Input.wasGamepadAxisJustPressed(0, 1, false)) this.setStageIndex(Game.stageIndice - StageSelectMenuBehavior.charsPerRow);
    if (Sup.Input.wasKeyJustPressed("DOWN") || Sup.Input.wasKeyJustPressed("S") || Sup.Input.wasGamepadAxisJustPressed(0, 1, true)) this.setStageIndex(Game.stageIndice + StageSelectMenuBehavior.charsPerRow);
    
    if (Sup.Input.wasKeyJustPressed("RETURN") || Sup.Input.wasGamepadButtonJustPressed(0, 9)) {
      Sup.Audio.playSound("Character Select Menu/Player Chosen");
      Game.start();
    } 
  }

  setStageIndex(charIndex: number, playSound = true) {
    if (playSound) Sup.Audio.playSound("Character Select Menu/Select Player");
    
    charIndex = Sup.Math.clamp(charIndex, 0, Game.stageNames.length - 1);
    Game.stageIndice = charIndex;
    
    const x = charIndex % StageSelectMenuBehavior.charsPerRow;
    const y = Math.floor(charIndex / StageSelectMenuBehavior.charsPerRow);
    
    this.selectActor.setLocalPosition(
      this.offset + x * StageSelectMenuBehavior.spaceBetween,
      -y * StageSelectMenuBehavior.spaceBetween);
  }
}
Sup.registerBehavior(StageSelectMenuBehavior);

namespace StageSelectMenuBehavior {
  export const spaceBetween = 4;
  export const charsPerRow = 3;
}