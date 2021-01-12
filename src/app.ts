import * as MRE from '@microsoft/mixed-reality-extension-sdk';

const BOX_DIMENSIONS = {width: 0.4, height: 0.4, depth: 0.4}

export default class SampleApp {
    private assets: MRE.AssetContainer 
    private triggers: Map<MRE.Guid, MRE.Actor>;
    // constructor
	constructor(private context: MRE.Context, private params: MRE.ParameterSet) {
        this.triggers = new Map<MRE.Guid, MRE.Actor>();
        this.assets = new MRE.AssetContainer(this.context);

        this.context.onUserJoined(user => this.userjoined(user));
        this.context.onUserLeft(user => this.userLeft(user));
    }
    
    private userjoined (user: MRE.User) {
        const transMat = this.assets.createMaterial('trans_red', {
            color: MRE.Color4.FromColor3(MRE.Color3.Red(), 0.1), alphaMode: MRE.AlphaMode.Blend
        });
        this.triggers.set(user.id, MRE.Actor.Create(this.context, {
            actor: {
                name: "trigger",
                appearance: {
                    meshId: this.assets.createBoxMesh('trigger', BOX_DIMENSIONS.width, BOX_DIMENSIONS.height, BOX_DIMENSIONS.depth).id,
                    materialId: transMat.id
                },
                transform: {
                    local: { position: {x:0, y:0, z:0} }
                },
                collider: {
                    geometry: { shape: MRE.ColliderType.Auto },
                    layer: MRE.CollisionLayer.Hologram
                },
                attachment: {
                    attachPoint: "spine-bottom",
                    userId: user.id
                }
            }
        }));
    }
    private userLeft (user: MRE.User) {
        this.triggers.get(user.id)?.destroy();
    }
}