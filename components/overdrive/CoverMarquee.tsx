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

/// One endlessly scrolling strip (the list twice, translated by -50%).
/// `phase` is a negative delay, so the columns start staggered, not aligned.
function Column({
  covers,
  animation,
  phase,
}: {
  covers: string[];
  animation: string;
  phase: string;
}) {
  const loop = [...covers, ...covers];
  return (
    <div className="overflow-hidden">
      {/* Hovering a column pauses it, so a cover can actually be looked at. */}
      <div
        className={`grid gap-4 ${animation} hover:[animation-play-state:paused]`}
        style={{ animationDelay: phase }}
      >
        {loop.map((src, i) => (
          <div key={`${src}-${i}`} className="ov-chamfer aspect-[3/4] overflow-hidden bg-ov-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="size-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

/// Sign-in cover wall: three chamfered columns bleeding off the top and
/// bottom edges, drifting in alternate directions.
export function CoverMarquee() {
  return (
    <div className="absolute inset-0 grid grid-cols-3 gap-4 px-4">
      <Column covers={COVERS.slice(0, 6)} animation="animate-ov-scrollup" phase="-12s" />
      <Column covers={COVERS.slice(6, 12)} animation="animate-ov-scrolldown" phase="-70s" />
      <Column covers={COVERS.slice(12, 18)} animation="animate-ov-scrollup-slow" phase="-40s" />
    </div>
  );
}
