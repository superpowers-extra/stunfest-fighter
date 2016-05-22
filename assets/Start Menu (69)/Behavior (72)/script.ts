class StartMenuBehavior extends Sup.Behavior {
  pressStart: Sup.Actor;
  timer = 0;

  awake() {
    if (Game.music != null) Game.music.stop();
    Game.music = Sup.Audio.playSound("Start Menu/Music", 0.3);
    
    this.pressStart = Sup.getActor("Press Start");
  }

  update() {
    if (Sup.Input.wasKeyJustPressed("RETURN") || Sup.Input.wasGamepadButtonJustPressed(0, 9)) {
      Sup.Audio.playSound("Start Menu/Start Game");
      Sup.loadScene("Character Select Menu/Scene");
    }

    this.timer++;
    this.pressStart.setVisible((this.timer % 10) < 5);
  }
}
Sup.registerBehavior(StartMenuBehavior);
