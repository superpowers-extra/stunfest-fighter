class PlayerBehavior extends Sup.Behavior {
  position: Sup.Math.Vector2;

  private index: number;
  private characterName: string;

  private spriteRndr: Sup.SpriteRenderer;
  private shadowActor: Sup.Actor;
  private verticalSpeed = 0;

  private specialTimer = 0;
  private hasAttacked = false;
  private hitTimer = 0;

  health = PlayerBehavior.maxHealth;
  private healthActor: Sup.Actor;
  private healthScale = 1;
  private hasWon = false;

  private action = 0;
  private actionOpacityTimer = 0;
  private actionActor: Sup.Actor;
  private actionScale = 0;

  private combo = 0;
  private comboTimer = 0;

  private loadSpecialCharacters = [ "Loopi" ];
  private projectileCharacters = [ "Moosh", "Pixel" ];
  private oneShotVictoryCharacters = [ "King", "Jon" ];

  private stepSound = new Sup.Audio.SoundPlayer("In-Game/Player/SFX/Step", 0.3);

  awake() {
    this.index = Game.players.length;
    Game.players.push(this);
    
    this.position = this.actor.getLocalPosition().toVector2();
    this.spriteRndr = this.actor.getChild("Sprite").spriteRenderer;
    this.shadowActor = this.actor.getChild("Shadow");
    
    this.characterName = Game.characterNames[Game.playerCharIndices[this.index]];
    this.spriteRndr.setSprite(`In-Game/Characters/${this.characterName}/Sprite`);
    this.spriteRndr.setColor(Game.playerColors[this.index]);
    this.spriteRndr.setAnimation("Idle");
    
    const hud = Sup.getActor("HUD").getChild(`Player ${this.index + 1}`);
    hud.getChild("Portrait").spriteRenderer.setSprite(`In-Game/Characters/${this.characterName}/Portrait`);
    hud.getChild("Name").textRenderer.setText(this.characterName);
    
    this.healthActor = hud.getChild("Health");
    this.actionActor = hud.getChild("Action");
    
    const labelRndr = this.actor.getChild("Label").textRenderer;
    labelRndr.setText(`J${this.index + 1}`);
    labelRndr.setColor(Game.playerLabelColors[this.index]);
  }

  update() {
    this.healthScale = Sup.Math.lerp(this.healthScale, this.health / PlayerBehavior.maxHealth, 0.2);
    if (this.healthScale === 0) this.healthActor.setVisible(false);
    else this.healthActor.setLocalScaleX(this.healthScale);
    
    if (this.action === PlayerBehavior.maxAction) {
      this.actionOpacityTimer += 1;
      const scaleFactor = 1 + Math.sin(this.actionOpacityTimer * 0.4) / 12;
      this.actionActor.setLocalScale(1, 0.1 * scaleFactor, 1);
    } else {
      this.actionScale = Sup.Math.lerp(this.actionScale, this.action / PlayerBehavior.maxAction, 0.2);
      if (this.actionScale === 0) {
        this.actionActor.setVisible(false);
      } else {
        this.actionActor.setVisible(true);
        this.actionActor.setLocalScale(this.actionScale, 0.1, 1);
      }
    }
    
    if (this.hasWon || this.health === 0) return;
    
    const controls = PlayerBehavior.controls[this.index];
    const horizontalAxis = Sup.Input.getGamepadAxisValue(this.index, 0);
    
    const enemyIndex = this.index === 0 ? 1 : 0;
    const enemy = Game.players[enemyIndex];
    
    this.verticalSpeed -= Game.gravity;
    this.position.y += this.verticalSpeed;
    
    if (this.position.y < 0) {
      if (this.verticalSpeed < -0.2) Sup.Audio.playSound("In-Game/Player/SFX/Land");
      
      this.position.y = 0;
      this.verticalSpeed = 0;
    }
    
    if (this.hitTimer > 0) this.hitTimer -= 1;
    if (this.specialTimer > 0) this.specialTimer -= 1;
    
    const flip = this.spriteRndr.getHorizontalFlip();
    
    this.comboTimer -= 1;
    if (this.position.y === 0 && (this.combo === 0 || this.comboTimer > 0)) {
      switch (this.combo) {
        case 0: {
          if ((flip && (Sup.Input.wasKeyJustPressed(controls.right) || Sup.Input.wasGamepadAxisJustPressed(this.index, 0, true))) ||
          (!flip && (Sup.Input.wasKeyJustPressed(controls.left) || Sup.Input.wasGamepadAxisJustPressed(this.index, 0, false)))) {
            this.combo = 1;
            this.comboTimer = PlayerBehavior.comboDelay;
          }
        } break;
        case 1: {
          if (Sup.Input.wasKeyJustPressed(controls.crouch) || Sup.Input.wasGamepadAxisJustPressed(this.index, 1, true)) {
            this.combo = 2;
            this.comboTimer = PlayerBehavior.comboDelay;
          }
        } break;
        case 2: {
          if ((!flip && (Sup.Input.wasKeyJustPressed(controls.right) || Sup.Input.wasGamepadAxisJustPressed(this.index, 0, true))) ||
          (flip && (Sup.Input.wasKeyJustPressed(controls.left) || Sup.Input.wasGamepadAxisJustPressed(this.index, 0, false)))) {
            this.combo = 3;
            this.comboTimer = PlayerBehavior.comboDelay;
          }
        } break;
      }
      
    } else {
      this.combo = 0;
    }
    
    if (this.position.y === 0 && (Sup.Input.isKeyDown(controls.block) || Sup.Input.isGamepadButtonDown(this.index, 1))) {
      this.changeState("Block");
    
    } else if (this.position.y === 0 && (Sup.Input.wasKeyJustPressed(controls.jump) || Sup.Input.wasGamepadButtonJustPressed(this.index, 0))) {
      this.verticalSpeed = PlayerBehavior.jumpSpeed;
      Sup.Audio.playSound("In-Game/Player/SFX/Jump");
      
    } else if (Sup.Input.wasKeyJustPressed(controls.attack) || Sup.Input.wasGamepadButtonJustPressed(this.index, 2)) {
      if (this.action === PlayerBehavior.maxAction && this.combo === PlayerBehavior.comboMax) {
        if (this.loadSpecialCharacters.indexOf(this.characterName) !== -1) {
          if (this.changeState("Attack Special Load")) {
            Sup.Audio.playSound(`In-Game/Player/SFX/Special/${this.characterName}`);
            this.action = 0;
            this.hasAttacked = false;
            this.specialTimer = PlayerBehavior.specialLoadDuration;
          }
        } else {
          if (this.changeState("Attack Special", false)) {
            Sup.Audio.playSound(`In-Game/Player/SFX/Special/${this.characterName}`);
            this.action = 0;
            this.hasAttacked = false;
          }
        }
        
      } else {
        if (this.changeState("Attack", false)) this.hasAttacked = false;
      }
      
    } else if (Sup.Input.wasKeyJustPressed(controls.taunt) || Sup.Input.wasGamepadButtonJustPressed(this.index, 3)) {
      if (this.changeState("Taunt", false)) Sup.Audio.playSound("In-Game/Player/SFX/Taunt");
      
    } else if (Sup.Input.isKeyDown(controls.left) || horizontalAxis < -0.5) {
      const currentAnimation = this.spriteRndr.getAnimation();
      const speed = currentAnimation === "Attack" ? PlayerBehavior.attackMoveSpeed : PlayerBehavior.speed;
      this.position.x -= speed;
      if (this.changeState("Walk") && !this.stepSound.isPlaying()) this.stepSound.play();
      
    } else if (Sup.Input.isKeyDown(controls.right) || horizontalAxis > 0.5) {
      const currentAnimation = this.spriteRndr.getAnimation();
      const speed = currentAnimation === "Attack" ? PlayerBehavior.attackMoveSpeed : PlayerBehavior.speed;
      this.position.x += speed;
      if (this.changeState("Walk") && !this.stepSound.isPlaying()) this.stepSound.play();
      
    } else {
      this.changeState("Idle");
    }
    
    this.position.x = Game.camera.clamp(this.position.x);
    this.actor.setLocalX(this.position.x);
    this.spriteRndr.actor.setLocalY(this.position.y);
    const shadowScale = Math.max(5 - this.position.y) / 5;
    this.shadowActor.setLocalScale(shadowScale, shadowScale, 1)
    
    if (this.position.x > enemy.position.x && !flip) this.spriteRndr.setHorizontalFlip(true);
    else if (this.position.x < enemy.position.x && flip) this.spriteRndr.setHorizontalFlip(false);
    
    const diffX = Math.abs(this.position.x - enemy.position.x);
    const diffY = Math.abs(this.position.y - enemy.position.y);
    if (!this.hasAttacked && this.isAttacking() && (!enemy.isCrouching() || this.isCrouching()) &&
    diffX < PlayerBehavior.hitDistance && diffY < PlayerBehavior.height / 2) {

      this.hasAttacked = true;
      
      const currentAnimation = this.spriteRndr.getAnimation();
      let damage = PlayerBehavior.damage;
      if (currentAnimation === "Attack Special") {
        if (this.projectileCharacters.indexOf(this.characterName) !== -1) return;
        damage = PlayerBehavior.specialDamage;
      }
      
      if (enemy.hit(damage)) {
        Sup.Audio.playSound("In-Game/Player/SFX/Attack");
        this.addAction(18);
        if (enemy.health === 0) this.win();
      } else {
        Sup.Audio.playSound("In-Game/Player/SFX/Block");
        this.addAction(6);
      }
    }
  }

  private changeState(animationName: string, loop = true, force = false) {
    if (force) {
      this.spriteRndr.setAnimation(animationName, loop);
      return false;
    }
    
    if (this.hitTimer > 0) return false;
    
    const currentAnimation = this.spriteRndr.getAnimation();
    
    if (currentAnimation === "Attack Special Load" && this.specialTimer === 0) {
      this.spriteRndr.setAnimation("Attack Special", false);
      return;
    }
    
    if ((currentAnimation.indexOf("Attack") !== -1 || currentAnimation === "Taunt") && this.spriteRndr.isAnimationPlaying())
      return false;

    if (currentAnimation === "Attack Special" && this.projectileCharacters.indexOf(this.characterName) !== -1) {
      const projectile = Sup.appendScene("In-Game/Projectile/Prefab")[0];
      const spriteName = `In-Game/Characters/${this.characterName}/Projectile`;
      projectile.getBehavior(ProjectileBehavior).setup(spriteName, this.position.x, this.spriteRndr.getHorizontalFlip(), this.index);
    }
    
    if (this.position.y === 0) {
      const controls = PlayerBehavior.controls[this.index];
      const verticalAxis = Sup.Input.getGamepadAxisValue(this.index, 1);
      if (animationName !== "Attack Special" && (Sup.Input.isKeyDown(controls.crouch) || verticalAxis > 0.5)) animationName = `Crouch ${animationName}`;
      this.spriteRndr.setAnimation(animationName, loop);
      
    } else {
      if (animationName === "Attack") this.spriteRndr.setAnimation("Attack" /* Jump*/, false);
      else if (this.verticalSpeed > 0) this.spriteRndr.setAnimation("Jump");
      else this.spriteRndr.setAnimation("Fall");
    }
    
    return true;
  }

  private isAttacking() {
    const currentAnimation = this.spriteRndr.getAnimation();
    if (currentAnimation.indexOf("Attack") === -1) return false;
    
    return (this.spriteRndr.getAnimationFrameTime() / this.spriteRndr.getAnimationFrameCount() > 0.5);
  }

  hit(amount: number) {
    if (this.health === 0) return false;
    
    const currentAnimation = this.spriteRndr.getAnimation();
    if (currentAnimation.indexOf("Block") !== -1) return false;
    
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) {
      this.changeState("Die", false, true);
    } else {
      this.addAction(8);
      this.hitTimer = PlayerBehavior.hitDuration;
      this.changeState("Hit", true, true);
    }
    
    return true;
  }

  win() {
    const loop = this.oneShotVictoryCharacters.indexOf(this.characterName) === -1;
    this.changeState("Victory", loop, true);
    this.hasWon = true;
  }

  isCrouching() {
    const currentAnimation = this.spriteRndr.getAnimation();
    return (currentAnimation.indexOf("Crouch") !== -1);
  }

  addAction(amount: number) {
    const currentAnimation = this.spriteRndr.getAnimation();
    if (currentAnimation === "Attack Special") return;
    
    this.action = Math.min(this.action + amount, PlayerBehavior.maxAction);
  }
}
Sup.registerBehavior(PlayerBehavior);

namespace PlayerBehavior {
  export const speed = 0.12;
  export const attackMoveSpeed = 0.06;
  export const jumpSpeed = 0.25;
  export const comboDelay = 15;
  export const comboMax = 3;
  
  export const damage = 60;
  export const specialDamage = 180;
  export const specialLoadDuration = 40;
  
  export const maxHealth = 1000;
  export const hitDuration = 10;
  export const immuneDuration = 40;
  
  export const maxAction = 100;
  
  export const height = 0.5;
  export const hitDistance = 2.5;
  
  export const controls = [
    { left: "Q", right: "D", jump: "Z", crouch: "S", attack: "C", block: "V", taunt: "B" },
    { left: "LEFT", right: "RIGHT", jump: "UP", crouch: "DOWN", attack: "K", block: "L", taunt: "M" }
  ];
}
