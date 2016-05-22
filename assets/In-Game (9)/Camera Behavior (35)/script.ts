class CameraBehavior extends Sup.Behavior {
  
  private position = this.actor.getLocalPosition().toVector2();
  private width: number;
  private aspectRatio: number;
  
  awake() {
    Game.camera = this;
    
    this.aspectRatio = this.actor.camera.getWidthToHeightRatio();
    
    const stageName = Game.stageNames[Game.stageIndice];
    Sup.getActor("Background").spriteRenderer.setSprite(`In-Game/Stages/${stageName}/Background`);
  }

  update() {
    // Menu
    if (Sup.Input.wasKeyJustPressed("ESCAPE") || Sup.Input.wasGamepadButtonJustPressed(0, 8)) {
      Sup.loadScene("Character Select Menu/Scene");
    }
    
    if (Game.players[0].health === 0 || Game.players[1].health === 0) {
      if (Sup.Input.wasKeyJustPressed("RETURN") || Sup.Input.wasGamepadButtonJustPressed(0, 9)) {
        Sup.loadScene("Character Select Menu/Scene");
      }
      return;
    }
    
    const x0 = Game.players[0].position.x;
    const x1 = Game.players[1].position.x;
    
    const orthographicScale = Sup.Math.clamp(Math.abs(x0 - x1), 6, 10);
    this.actor.camera.setOrthographicScale(orthographicScale);
    
    this.position.y = 3.5 - (10 - orthographicScale) * 0.4;
    this.actor.setLocalY(this.position.y);
    
    this.width = orthographicScale * this.aspectRatio * 0.8;
    
    const limit = CameraBehavior.limit - this.width / 2;
    this.position.x = Sup.Math.clamp((x0 + x1) / 2, -limit, limit);
    this.actor.setLocalX(this.position.x);
  }
  
  clamp(x: number) {
    return Sup.Math.clamp(x, this.position.x - this.width / 2, this.position.x + this.width / 2);
  }
}
Sup.registerBehavior(CameraBehavior);

namespace CameraBehavior {
  export const limit = 15;
}
