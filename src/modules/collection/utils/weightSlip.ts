import { escapeHtml as escape, sharePdf } from "@/common/utils/sharePdf";
import { formatKg } from "@/common/utils/format";
import type { CentreDay, Collection, Worker } from "@/modules/centre/types/centreDay";

// The tapper's latex weight slip for one entry, the same details as the web portal's slip
function weightSlipHtml(entry: Collection, worker: Worker, day: CentreDay): string {
	const block = entry.block_id ? day.blocks.find((b) => b.block_id === entry.block_id) : undefined;
	const blockText = entry.block_no ? `${entry.block_no}${block?.block_class ? ` (Class ${block.block_class})` : ""}` : "—";
	const row = (label: string, value: string, strong = false) => `<tr${strong ? ' class="total"' : ""}><td>${label}</td><td class="v">${value}</td></tr>`;
	const place = [day.estate?.name, day.centre.name].filter(Boolean).join(" · ");
	return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
		<title>Weight slip ${escape(worker.name)} ${day.date}</title>
		<style>
			@page{size:80mm 120mm;margin:0}
			*{box-sizing:border-box}
			body{font-family:-apple-system,Roboto,sans-serif;color:#16211b;margin:0}
			.slip{width:100%;padding:3mm}
			h1{font-size:13px;color:#1f6b3b;text-align:center;margin:0}
			.place{font-size:9px;color:#5b6b62;text-align:center;margin:2px 0 6px}
			table{width:100%;border-collapse:collapse;font-size:11px}
			td{padding:3px 0;border-bottom:1px solid #e4e9e6}td:first-child{color:#5b6b62}
			.v{text-align:right;font-variant-numeric:tabular-nums}
			.gap td{border-bottom:2px solid #cdd5d0}
			.total td{font-weight:700;font-size:13px;color:#16211b;border-bottom:0;padding-top:6px}
			.foot{font-size:8px;color:#8a978f;text-align:center;margin-top:6px}
		</style></head><body><section class="slip">
			<h1>SFCK — Latex weight slip</h1>
			<div class="place">${escape(place)}</div>
			<table>
				${row("Date", day.date)}
				${row("Tapper", escape(worker.name))}
				${row("Code / check roll", escape(`${worker.current_code ?? "—"} / ${worker.check_roll_no}`))}
				<tr class="gap"><td>Block</td><td class="v">${escape(blockText)}</td></tr>
				${row("Latex (wet)", `${formatKg(entry.latex_kg)} kg`)}
				${row("Sample DRC", `${entry.sample_drc} %`)}
				${row("Dry latex", `${entry.dry_latex.toFixed(3)} kg`)}
				${row("Scrap", `${formatKg(entry.scrap_kg)} kg`)}
				<tr class="gap"><td>Dry scrap (${entry.scrap_drc_percent}%)</td><td class="v">${entry.dry_scrap.toFixed(3)} kg</td></tr>
				${row("Total dry rubber", `${entry.total_dry.toFixed(3)} kg`, true)}
			</table>
			<div class="foot">${entry.id ? `Record #${entry.id} · ` : "Not synced yet · "}entered via mobile</div>
		</section></body></html>`;
}

export function shareWeightSlip(entry: Collection, worker: Worker, day: CentreDay): Promise<void> {
	// 80 x 120 mm in points, the size of the web portal's slip
	return sharePdf(weightSlipHtml(entry, worker, day), `Weight slip · ${worker.name} · ${day.date}`, { width: 227, height: 340 });
}
