class ProjectileBehavior extends Sup.Behavior {
  
  private player: PlayerBehavior;
  private enemy: PlayerBehavior;
  private direction: number;
  private position = new Sup.Math.Vector2(0, 0);

  private life = 120;
  
  setup(sprite: string, x: number, flip: boolean, index: number) {
    this.actor.spriteRenderer.setSprite(sprite);
    this.actor.spriteRenderer.setHorizontalFlip(flip);
    this.actor.spriteRenderer.setAnimation("Animation", false);
    
    this.direction = flip ? -1 : 1;
    this.player = Game.players[index];
    this.enemy = Game.players[index === 0 ? 1 : 0];
    
    this.position.x = x + this.direction * 2;
    this.actor.setLocalPosition(this.position.x, 2, 1);
  }

  update() {
    this.life -= 1;
    if (this.life === 0) {
      this.actor.destroy();
      return;
    }
    
    this.position.x += this.direction * 0.2;
    this.actor.setLocalX(this.position.x);
    const enemyPosition = this.enemy.position;
    const distance = this.position.distanceTo(enemyPosition);
    if (distance < 1) {
      this.enemy.hit(PlayerBehavior.specialDamage);
      if (this.enemy.health === 0) this.player.win();
      this.actor.destroy();
    }
  }
}
Sup.registerBehavior(ProjectileBehavior);
