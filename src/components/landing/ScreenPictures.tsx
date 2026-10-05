// Small pictures of the real screens, drawn in HTML and CSS.
// They are decorations only: not clickable, hidden from screen readers.

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none w-full select-none rounded-2xl border border-kumo-line bg-[#121212] p-4 sm:p-5"
    >
      {children}
    </div>
  );
}

export function CheckInPicture() {
  return (
    <Frame>
      <div className="rounded-2xl border border-green-500/40 bg-green-500/10 p-5">
        <p className="font-heading text-3xl font-semibold text-green-500">Welcome back, Nimali!</p>
        <p className="mt-1 text-sm text-kumo-subtle">Checked in.</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-kumo-tint text-base font-semibold">
            NP
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight">Nimali Perera</p>
            <p className="text-xs text-kumo-subtle">GF-0001 · Monthly</p>
          </div>
          <span className="ml-auto rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-500">
            Active
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <div>
            <dt className="text-kumo-subtle">Expires</dt>
            <dd className="mt-1 font-medium">28 Oct 2026</dd>
          </div>
          <div>
            <dt className="text-kumo-subtle">Last visit</dt>
            <dd className="mt-1 font-medium">3 Oct 2026</dd>
          </div>
          <div>
            <dt className="text-kumo-subtle">Balance owed</dt>
            <dd className="mt-1 font-medium">None</dd>
          </div>
        </dl>
      </div>
    </Frame>
  );
}

export function ReceiptPicture() {
  return (
    <Frame>
      <div className="mx-auto max-w-xs rounded-lg bg-white p-5 text-black">
        <div className="font-heading text-2xl">GymFlow</div>
        <div className="text-xs text-neutral-600">Payment receipt</div>
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Member</span>
            <span>Kasun Fernando (GF-0005)</span>
          </div>
          <div className="flex justify-between">
            <span>Method</span>
            <span>Cash</span>
          </div>
          <div className="flex justify-between">
            <span>Valid until</span>
            <span>4 Nov 2026</span>
          </div>
        </div>
        <div className="mt-3 flex justify-between border-t border-neutral-300 pt-2 text-sm font-semibold">
          <span>Amount paid</span>
          <span>LKR 2,000</span>
        </div>
        <div className="mt-1 flex justify-between text-xs">
          <span>Balance remaining</span>
          <span>LKR 1,000</span>
        </div>
        <div className="mt-3 text-xs text-neutral-600">Received by Receptionist. Thank you!</div>
      </div>
    </Frame>
  );
}

const ROWS = [
  { name: "Ruwan Bandara", number: "GF-0007", when: "Expires today", owes: "" },
  { name: "Lahiru Dissanayake", number: "GF-0011", when: "Expires 7 Oct 2026", owes: "Owes LKR 1,000" },
  { name: "Dilani Silva", number: "GF-0003", when: "Expires 8 Oct 2026", owes: "" },
];

export function ExpiringPicture() {
  return (
    <Frame>
      <h4 className="font-heading text-xl">
        Next 3 days <span className="text-neutral-500">({ROWS.length})</span>
      </h4>
      <div className="mt-2 overflow-hidden rounded-xl border border-kumo-line bg-kumo-base">
        {ROWS.map((r) => (
          <div
            key={r.number}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-kumo-line px-3 py-2.5 text-xs last:border-b-0"
          >
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-neutral-400">{r.number}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-neutral-300">{r.when}</span>
              {r.owes && <span className="text-yellow-400">{r.owes}</span>}
              <span className="rounded-md bg-kumo-tint px-2.5 py-1 font-medium">Call</span>
              <span className="rounded-md bg-kumo-tint px-2.5 py-1 font-medium">Message</span>
              <span className="rounded-md bg-[#FF6A00] px-2.5 py-1 font-medium text-black">Renew</span>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}