import { Actor, AlphaMode, AssetContainer, ColliderType, CollisionLayer, Color3, Color4, Context, Guid, ParameterSet, User } from '@microsoft/mixed-reality-extension-sdk';

const layers: {[n: number]: (string | CollisionLayer)}= {
    0:  CollisionLayer.Default,
    1:  CollisionLayer.Hologram,
    5:  CollisionLayer.UI,
    14: CollisionLayer.Navigation,
    // 18: "artifact:1669952407167041968"
    18: "artifact:1813545044632666976"
};

export default class SampleApp {
    private assets: AssetContainer 
    private triggers: Map<Guid, Actor>;
    // constructor
	constructor(private context: Context, private params: ParameterSet) {
        this.triggers = new Map<Guid, Actor>();
        this.assets = new AssetContainer(this.context);

        this.context.onUserJoined(user => this.userjoined(user));
        this.context.onUserLeft(user => this.userLeft(user));
    }
    
    private userjoined (user: User) {
        const transMat = this.assets.createMaterial('trans_red', {
            color: Color4.FromColor3(Color3.Red(), 0.1), alphaMode: AlphaMode.Blend
        });
        const size = this.params.size ? parseFloat(this.params.size as string) : 0.4;
        const pos = this.params.pos ? parseFloat(this.params.pos as string) : 0;
        let layer = layers[ this.params.layer ? parseInt(this.params.layer as string) : 0 ];
        layer = this.params.artifactId ? this.params.artifactId as string : layer;

        // not supported
        if (layer === undefined) { return; }

        let actor: Actor;
        if (Object.values(CollisionLayer).includes(layer as CollisionLayer)){
            actor = Actor.Create(this.context, {
                actor: {
                    appearance: {
                        meshId: this.assets.createBoxMesh('trigger', size, size, size).id,
                        materialId: transMat.id
                    },
                    transform: {
                        local: { position: {x: 0, y: pos, z: 0} }
                    },
                    collider: {
                        geometry: { shape: ColliderType.Auto },
                        layer: layer as CollisionLayer
                    },
                    attachment: {
                        attachPoint: "spine-middle",
                        userId: user.id
                    }
                }
            });
        }else{
            actor = Actor.CreateFromLibrary(this.context, {
                resourceId: layer,
                actor: {
                    transform: {
                        local: { position: {x: 0, y: pos, z: 0} }
                    },
                    attachment: {
                        attachPoint: "spine-middle",
                        userId: user.id
                    }
                }
            });
        }
        this.triggers.set(user.id, actor);
    }
    private userLeft (user: User) {
        this.triggers.get(user.id)?.destroy();
    }
}
