class CharacterSelectMenuBehavior extends Sup.Behavior {
  private playerSelectedActors: Sup.Actor[];
  private playerSelectActors: Sup.Actor[];

  private offset = (-CharacterSelectMenuBehavior.charsPerRow + 1) * CharacterSelectMenuBehavior.spaceBetween / 2;

  awake() {
    if (Game.music != null) Game.music.stop();
    Sup.setTimeout(1000, () => {
      Game.music = Sup.Audio.playSound("Character Select Menu/Music", 0.3, { loop: true });
    });
    
    const portraitsActor = Sup.getActor("Portraits");
    
    this.playerSelectedActors = Sup.getActor("Selected Players").getChildren();
    this.playerSelectActors = [];
    
    for (let i = 0; i < 2; i++) {
      const actor = new Sup.Actor(`Player Select ${i}`, portraitsActor);
      actor.setLocalScale(2.3);
      new Sup.SpriteRenderer(actor, "Character Select Menu/Select");
      this.playerSelectActors.push(actor);
      
      const label = new Sup.Actor("Label", actor);
      label.setLocalScale(0.2);
      new Sup.TextRenderer(label, `J${i + 1}`, "Character Select Menu/Font");
      label.textRenderer.setColor(Game.playerLabelColors[i]);
      label.setLocalPosition(-0.18 + i * 0.36, 0.5);
    }
    
    for (let i = 0; i < Game.characterNames.length; i++) {
      const name = Game.characterNames[i];
      const portraitActor = new Sup.Actor("Portrait", portraitsActor);
      new Sup.SpriteRenderer(portraitActor, `In-Game/Characters/${name}/Portrait`);
      portraitActor.setLocalScale(0.35);
      
      const x = i % CharacterSelectMenuBehavior.charsPerRow;
      const y = Math.floor(i / CharacterSelectMenuBehavior.charsPerRow);
      portraitActor.setLocalPosition(
        this.offset + x * CharacterSelectMenuBehavior.spaceBetween,
        -y * CharacterSelectMenuBehavior.spaceBetween, 1);
    }
    
    this.setPlayerCharIndex(0, Game.playerCharIndices[0], false);
    this.setPlayerCharIndex(1, Game.playerCharIndices[1], false);
  }

  update() {
    if (Sup.Input.wasKeyJustPressed("Q") || Sup.Input.wasGamepadAxisJustPressed(0, 0, false)) this.setPlayerCharIndex(0, Game.playerCharIndices[0] - 1);
    if (Sup.Input.wasKeyJustPressed("D") || Sup.Input.wasGamepadAxisJustPressed(0, 0, true)) this.setPlayerCharIndex(0, Game.playerCharIndices[0] + 1);
    if (Sup.Input.wasKeyJustPressed("Z") || Sup.Input.wasGamepadAxisJustPressed(0, 1, false)) this.setPlayerCharIndex(0, Game.playerCharIndices[0] - CharacterSelectMenuBehavior.charsPerRow);
    if (Sup.Input.wasKeyJustPressed("S") || Sup.Input.wasGamepadAxisJustPressed(0, 1, true)) this.setPlayerCharIndex(0, Game.playerCharIndices[0] + CharacterSelectMenuBehavior.charsPerRow);

    if (Sup.Input.wasKeyJustPressed("LEFT") || Sup.Input.wasGamepadAxisJustPressed(1, 0, false)) this.setPlayerCharIndex(1, Game.playerCharIndices[1] - 1)
    if (Sup.Input.wasKeyJustPressed("RIGHT") || Sup.Input.wasGamepadAxisJustPressed(1, 0, true)) this.setPlayerCharIndex(1, Game.playerCharIndices[1] + 1);
    if (Sup.Input.wasKeyJustPressed("UP") || Sup.Input.wasGamepadAxisJustPressed(1, 1, false)) this.setPlayerCharIndex(1, Game.playerCharIndices[1] - CharacterSelectMenuBehavior.charsPerRow);
    if (Sup.Input.wasKeyJustPressed("DOWN") || Sup.Input.wasGamepadAxisJustPressed(1, 1, true)) this.setPlayerCharIndex(1, Game.playerCharIndices[1] + CharacterSelectMenuBehavior.charsPerRow);

    if (Sup.Input.wasKeyJustPressed("RETURN") || Sup.Input.wasGamepadButtonJustPressed(0, 9)) {
      Sup.Audio.playSound("Character Select Menu/Player Chosen");
      Sup.loadScene("Stage Select Menu/Scene");
    }
  }

  setPlayerCharIndex(playerIndex: number, charIndex: number, playSound = true) {
    if (playSound) Sup.Audio.playSound("Character Select Menu/Select Player");
    
    charIndex = Sup.Math.clamp(charIndex, 0, Game.characterNames.length - 1);
    Game.playerCharIndices[playerIndex] = charIndex;
    
    const x = charIndex % CharacterSelectMenuBehavior.charsPerRow;
    const y = Math.floor(charIndex / CharacterSelectMenuBehavior.charsPerRow);
    
    this.playerSelectActors[playerIndex].setLocalPosition(
      this.offset + x * CharacterSelectMenuBehavior.spaceBetween,
      -y * CharacterSelectMenuBehavior.spaceBetween);
    
    const name = Game.characterNames[charIndex];
    const spriteRndr = this.playerSelectedActors[playerIndex].spriteRenderer;
    spriteRndr.setSprite(`In-Game/Characters/${name}/Sprite`).setAnimation("Menu", false);

    this.playerSelectedActors[playerIndex].getChild("Label").textRenderer.setText(name);
  }
}
Sup.registerBehavior(CharacterSelectMenuBehavior);

namespace CharacterSelectMenuBehavior {
  export const spaceBetween = 2;
  export const charsPerRow = 3;
}
