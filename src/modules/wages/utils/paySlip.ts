import { escapeHtml as escape, sharePdf } from "@/common/utils/sharePdf";

import type { WageLine, WageSheet } from "../types/wages";
import { isSalaried, money } from "./wageFormat";

// One person's pay slip, the same layout as the web portal's salary slips
function slipSection(line: WageLine, sheet: WageSheet, centreName: string): string {
	const row = (ml: string, en: string, value: string) => `<tr><td>${ml}<span>${en}</span></td><td class="v">${value}</td></tr>`;
	const earnings = isSalaried(line)
		? row("ശമ്പളം", "Salary", money(line.wages))
		: [
				row("ഹാജർ ദിവസം", "Days", String(line.days)),
				row("ദിവസക്കൂലി", "Daily rate", money(line.daily_rate)),
				row("കൂലി", "Wages", money(line.wages)),
				line.total_dry ? row("ഉണക്ക റബ്ബർ (കി.ഗ്രാ)", "Dry rubber kg", line.total_dry.toFixed(3)) : "",
				line.incentive ? row("ഇൻസെന്റീവ്", "Incentive", money(line.incentive)) : "",
				line.leave_pay ? row("അവധി വേതനം", "Leave pay", money(line.leave_pay)) : "",
				line.holiday_pay ? row("അവധിദിന വേതനം", "Holiday pay", money(line.holiday_pay)) : "",
				line.washing_allowance ? row("വാഷിംഗ് അലവൻസ്", "Washing allowance", money(line.washing_allowance)) : "",
			].join("");
	// the client's named earnings and recoveries, in Malayalam and English; what is left of the recoveries is "other"
	const headRow = (h: WageLine["heads"][number], sign: string) => row(escape(h.label_ml ?? h.label), escape(h.label_ml ? h.label : ""), sign + money(h.amount));
	const earningHeads = line.heads.filter((h) => h.kind === "earning").map((h) => headRow(h, "")).join("");
	const recoveryHeads = line.heads.filter((h) => h.kind === "recovery");
	const otherRecoveries = Math.round((line.recoveries - recoveryHeads.reduce((sum, h) => sum + h.amount, 0)) * 100) / 100;
	const recoveries = recoveryHeads.map((h) => headRow(h, "− ")).join("") + (otherRecoveries > 0 ? row("മറ്റ് പിടിത്തം", "Other recoveries", "− " + money(otherRecoveries)) : "");
	const paid = line.paid_amount !== null ? row("നൽകിയത്", `Paid${line.paid_on ? ` on ${line.paid_on.slice(0, 10)}` : ""}`, money(line.paid_amount)) : "";
	return `<section class="slip">
			<header><div><b>സ്റ്റേറ്റ് ഫാമിംഗ് കോർപ്പറേഷൻ ഓഫ് കേരള</b><small>State Farming Corporation of Kerala · ${escape(centreName)}</small></div><div class="p">ശമ്പള സ്ലിപ്പ് · Pay slip<br/>${sheet.period.start.slice(0, 10)} – ${sheet.period.end.slice(0, 10)}</div></header>
			<div class="who"><b>${escape(line.employee_name ?? "")}</b><br/><span>${escape([line.check_roll_no, line.employee_code].filter(Boolean).join(" · "))}</span></div>
			<table>
				${earnings}
				${line.lcc ? row("എൽ.സി.സി", "LCC", money(line.lcc)) : ""}
				${earningHeads}
				${line.interim_relief ? row("ഇടക്കാലാശ്വാസം", "Interim relief", money(line.interim_relief)) : ""}
				${row("ആകെ", "Gross", money(line.gross))}
				${row("പി.എഫ്", "PF", "− " + money(line.pf))}
				${recoveries}
				<tr class="net"><td>അറ്റ ശമ്പളം<span>Net pay</span></td><td class="v">${money(line.net)}</td></tr>
				${line.voucher_amount ? row("വൗച്ചർ (പ്രത്യേകം, പി.എഫ് ഇല്ല)", "Voucher (paid separately, no PF)", money(line.voucher_amount)) : ""}
				${line.voucher_amount ? `<tr class="net"><td>ആകെ നൽകേണ്ടത്<span>Total payable (net + voucher)</span></td><td class="v">${money(Math.round((line.net + line.voucher_amount) * 100) / 100)}</td></tr>` : ""}
				${paid}
			</table>
		</section>`;
}

// The slips as one printable page, each slip on its own sheet of paper
function slipsHtml(lines: WageLine[], sheet: WageSheet, centreName: string, title: string): string {
	return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
		<title>${escape(title)}</title>
		<style>
			body{font-family:-apple-system,Roboto,"Noto Sans Malayalam",sans-serif;color:#1d2b22;margin:0;padding:24px}
			.slip{max-width:520px;margin:0 auto;border:1px solid #cdd5d0;border-radius:6px;padding:20px;page-break-inside:avoid}
			.slip+.slip{page-break-before:always;break-before:page;margin-top:24px}
			header{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #cdd5d0;padding-bottom:10px;margin-bottom:10px}
			header small{display:block;color:#5b6b61;font-size:11px}.p{text-align:right;font-size:12px}
			.who{margin-bottom:10px;font-size:13px}.who span{color:#5b6b61}
			table{width:100%;border-collapse:collapse;font-size:13px}td{padding:5px 0;border-bottom:1px solid #eef1ef}
			td span{display:block;color:#5b6b61;font-size:11px}.v{text-align:right;font-variant-numeric:tabular-nums}
			.net td{font-weight:700;border-top:2px solid #1d2b22;border-bottom:0}
		</style></head><body>${lines.map((line) => slipSection(line, sheet, centreName)).join("")}</body></html>`;
}

// One person's slip
export function sharePaySlip(line: WageLine, sheet: WageSheet, centreName: string): Promise<void> {
	const title = `Pay slip · ${line.employee_name ?? ""} · ${sheet.period.label}`;
	return sharePdf(slipsHtml([line], sheet, centreName, title), title);
}

// Everyone's slips in one PDF
export function shareAllPaySlips(lines: WageLine[], sheet: WageSheet, centreName: string): Promise<void> {
	const title = `Pay slips · ${centreName} · ${sheet.period.label}`;
	return sharePdf(slipsHtml(lines, sheet, centreName, title), title);
}
