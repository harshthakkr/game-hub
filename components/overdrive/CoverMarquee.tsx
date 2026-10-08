const COVERS = [
  "/covers/Metal_Gear_Solid_Delta_Snake_Eater_cover.jpg",
  "/covers/Marvel_s_Spider_Man_cover.jpg",
  "/covers/Limbo_cover.jpg",
  "/covers/Resident_Evil_4_cover.jpg",
  "/covers/Grand_Theft_Auto_VI_cover.jpg",
  "/covers/Red_Dead_Redemption_2_cover.jpg",
  "/covers/Call_of_Duty_Modern_Warfare_cover.jpg",
  "/covers/Minecraft_cover.jpg",
  "/covers/Sifu_cover.jpg",
  "/covers/The_Legend_of_Zelda_Breath_of_the_Wild_cover.jpg",
  "/covers/EA_Sports_FC_25_cover.jpg",
  "/covers/Cyberpunk_2077_cover.jpg",
  "/covers/The_Last_of_Us_cover.jpg",
  "/covers/Subway_Surfers_cover.jpg",
  "/covers/Sekiro_Shadows_Die_Twice_cover.jpg",
  "/covers/Ghost_of_Yotei_cover.jpg",
  "/covers/Assassin_s_Creed_Origins_cover.jpg",
  "/covers/Alan_Wake_II_cover.jpg",
];

function Column({
  covers,
  animation,
}: {
  covers: string[];
  animation: string;
}) {
  const loop = [...covers, ...covers];
  return (
    <div className="overflow-hidden">
      <div className={`grid gap-4 ${animation}`}>
        {loop.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            className="aspect-[3/4] w-full object-cover"
          />
        ))}
      </div>
    </div>
  );
}

export function CoverMarquee() {
  const a = COVERS.slice(0, 6);
  const b = COVERS.slice(6, 12);
  const c = COVERS.slice(12, 18);
  return (
    <div className="absolute inset-0 grid grid-cols-3 gap-4 p-4">
      <Column covers={a} animation="animate-ov-scrollup" />
      <Column
        covers={b}
        animation="animate-ov-scrolldown"
      />
      <Column
        covers={c}
        animation="animate-ov-scrollup-slow"
      />
    </div>
  );
}
