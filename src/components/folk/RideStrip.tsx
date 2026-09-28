import Folk from "./Folk";

function House() {
  return (
    <svg viewBox="0 0 60 50" className="h-full w-auto" aria-hidden="true">
      <path d="M4 22 L30 4 L56 22 Z" fill="currentColor" />
      <rect x={10} y={21} width={40} height={29} fill="currentColor" />
      <rect x={25} y={31} width={10} height={19} rx={5} fill="var(--folk-sep)" />
      <rect x={14} y={27} width={7} height={7} fill="var(--folk-sep)" />
      <rect x={39} y={27} width={7} height={7} fill="var(--folk-sep)" />
      <circle cx={30} cy={15} r={2.4} fill="var(--folk-sep)" />
    </svg>
  );
}

/** A milkman cycling along a road from the goshala to a customer's home, looping. */
export default function RideStrip({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`folk pointer-events-none relative select-none ${className ?? ""}`}>
      <div className="relative h-[100px] overflow-hidden sm:h-[132px]">
        <div className="absolute bottom-[22px] left-0 flex items-end gap-2">
          <Folk scene="grazing" h="h-[46px] sm:h-[72px]" />
        </div>
        <div className="absolute bottom-[22px] right-0 h-[40px] sm:h-[62px]">
          <House />
        </div>
        <div className="absolute inset-x-0 bottom-[21px] h-[1.5px] bg-current opacity-70" />
        <div className="absolute inset-x-[12%] bottom-[14px] h-px border-t border-dashed border-current opacity-50" />
        <div className="ride-strip absolute bottom-[22px]">
          <Folk scene="cycle" h="h-[62px] sm:h-[88px]" />
        </div>
      </div>
      <div className="flex justify-between font-deva text-[12.5px] text-ghee-deep sm:text-[13.5px]">
        <span>गौशाला · सुबह 4 बजे</span>
        <span>आपका घर · 7 बजे</span>
      </div>
    </div>
  );
}
