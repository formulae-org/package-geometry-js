/*
Fōrmulæ geometry package. Module for expression definition & visualization.
Copyright (C) 2015-2026 Laurence R. Ugalde

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

"use strict";

export class GeometryPackage extends Formulae.ExpressionPackage {};

const ACCENT_H_FRAC   = 0.30;  // accent-over region height as fraction of fontSize
const ACCENT_GAP      = 2;     // px gap between accent and content
const PREFIX_GAP_FRAC = 0.08;  // gap between ∠/△ symbol and first child
const ARROW_W_FRAC    = 0.25;  // arrowhead width as fraction of fontSize
const LINE_THICK_FRAC = 0.06;  // line stroke width as fraction of fontSize

// ─── GeometryPrefixBase: shared for Angle and Triangle ────────────────────────
// Renders a prefix symbol followed by children concatenated without separator.

const GeometryPrefixBase = class extends Expression {
	getPrefix() { return ""; }
	
	prepareDisplay(context) {
		const fontSize = context.fontInfo.size;
		const gap      = Math.round(fontSize * PREFIX_GAP_FRAC);
		this.gpPrefixW = Math.ceil(context.measureText(this.getPrefix()).width);
		
		let maxBaseline = Math.round(fontSize / 2);
		let maxBelow    = Math.round(fontSize / 2);
		
		for (const ch of this.children) {
			ch.prepareDisplay(context);
			if (ch.horzBaseline > maxBaseline) maxBaseline = ch.horzBaseline;
			if (ch.height - ch.horzBaseline > maxBelow) maxBelow = ch.height - ch.horzBaseline;
		}
		
		this.horzBaseline = maxBaseline;
		
		let x = this.gpPrefixW + gap;
		for (const ch of this.children) {
			ch.x = x;
			ch.y = this.horzBaseline - ch.horzBaseline;
			x += ch.width;
		}
		
		this.width        = x;
		this.height       = this.horzBaseline + maxBelow;
		this.vertBaseline = Math.round(this.width / 2);
	}
	
	display(context, x, y) {
		super.drawText(context, this.getPrefix(), x, y + this.horzBaseline + Math.round(context.fontInfo.size / 2));
		for (const ch of this.children) {
			ch.display(context, x + ch.x, y + ch.y);
		}
	}
	
	moveTo(direction) {
		return direction === Expression.PREVIOUS
			? this.children[this.children.length - 1].moveTo(direction)
			: this.children[0].moveTo(direction);
	}
	
	moveAcross(i, direction) {
		if (direction === Expression.NEXT     && i < this.children.length - 1) return this.children[i + 1].moveTo(direction);
		if (direction === Expression.PREVIOUS && i > 0)                        return this.children[i - 1].moveTo(direction);
		return this.moveOut(direction);
	}
};

// ─── Geometry.Angle ∠ABC ─────────────────────────────────────────────────────

const Angle = class extends GeometryPrefixBase {
	getTag()               { return "Geometry.Angle"; }
	getName()              { return GeometryPackage.messages.nameAngle; }
	canHaveChildren(count) { return count >= 1; }
	getChildName(i)        { return GeometryPackage.messages.childAnglePoint; }
	getPrefix()            { return "∠"; }
};

// ─── Geometry.Triangle △ABC ──────────────────────────────────────────────────

const Triangle = class extends GeometryPrefixBase {
	getTag()               { return "Geometry.Triangle"; }
	getName()              { return GeometryPackage.messages.nameTriangle; }
	canHaveChildren(count) { return count === 3; }
	getChildName(i)        { return GeometryPackage.messages.childTriangleVertex; }
	getPrefix()            { return "△"; }
};

// ─── AccentOver: shared for Arc, Segment, Ray, Line ───────────────────────────
// Renders a subexpression with a geometric accent drawn above it.

const AccentOver = class extends Expression {
	canHaveChildren(count) { return count === 1; }
	getChildName(i)        { return GeometryPackage.messages.childAccentLabel; }
	
	prepareDisplay(context) {
		const fontSize  = context.fontInfo.size;
		const accentH   = Math.round(fontSize * ACCENT_H_FRAC);
		const lineWidth = Math.max(1, Math.round(fontSize * LINE_THICK_FRAC));
		const arrowW    = Math.max(4, Math.round(fontSize * ARROW_W_FRAC));
		
		const ch0 = this.children[0];
		ch0.prepareDisplay(context);
		
		this.aoAccentH   = accentH;
		this.aoLineWidth = lineWidth;
		this.aoArrowW    = arrowW;
		
		ch0.x = 0;
		ch0.y = accentH + ACCENT_GAP;
		
		this.width        = ch0.width;
		this.height       = accentH + ACCENT_GAP + ch0.height;
		this.horzBaseline = accentH + ACCENT_GAP + ch0.horzBaseline;
		this.vertBaseline = Math.round(this.width / 2);
	}
	
	display(context, x, y) {
		this.drawAccent(context, x, y, this.width, this.aoAccentH, this.aoLineWidth, this.aoArrowW);
		const ch0 = this.children[0];
		ch0.display(context, x + ch0.x, y + ch0.y);
	}
	
	drawAccent(context, x, y, width, accentH, lineWidth, arrowW) {}
	
	moveTo(direction)        { return this.children[0].moveTo(direction); }
	moveAcross(i, direction) { return this.moveOut(direction); }
};

// ─── Geometry.Segment: overline ───────────────────────────────────────────────

const Segment = class extends AccentOver {
	getTag()  { return "Geometry.Segment"; }
	getName() { return GeometryPackage.messages.nameSegment; }
	
	drawAccent(context, x, y, width, accentH, lineWidth, arrowW) {
		const lineY = y + Math.round(accentH / 2);
		context.save();
		context.lineWidth = lineWidth;
		context.beginPath();
		context.moveTo(x,         lineY);
		context.lineTo(x + width, lineY);
		context.stroke();
		context.restore();
	}
};

// ─── Geometry.Arc: arc over ────────────────────────────────────────────────────

const Arc = class extends AccentOver {
	getTag()  { return "Geometry.Arc"; }
	getName() { return GeometryPackage.messages.nameArc; }
	
	drawAccent(context, x, y, width, accentH, lineWidth, arrowW) {
		context.save();
		context.lineWidth = lineWidth;
		context.beginPath();
		// Quadratic bezier arcing upward: ends at bottom of accent area, peak at top center
		context.moveTo(x,         y + accentH);
		context.quadraticCurveTo(x + Math.round(width / 2), y, x + width, y + accentH);
		context.stroke();
		context.restore();
	}
};

// ─── Geometry.Ray: right arrow over ───────────────────────────────────────────

const Ray = class extends AccentOver {
	getTag()  { return "Geometry.Ray"; }
	getName() { return GeometryPackage.messages.nameRay; }
	
	drawAccent(context, x, y, width, accentH, lineWidth, arrowW) {
		const lineY = y + Math.round(accentH / 2);
		context.save();
		context.lineWidth = lineWidth;
		context.beginPath();
		// Shaft
		context.moveTo(x,                 lineY);
		context.lineTo(x + width - arrowW, lineY);
		// Right arrowhead
		context.moveTo(x + width - arrowW, y);
		context.lineTo(x + width,          lineY);
		context.lineTo(x + width - arrowW, y + accentH);
		context.stroke();
		context.restore();
	}
};

// ─── Geometry.Line: double arrow over ─────────────────────────────────────────

const Line = class extends AccentOver {
	getTag()  { return "Geometry.Line"; }
	getName() { return GeometryPackage.messages.nameLine; }
	
	drawAccent(context, x, y, width, accentH, lineWidth, arrowW) {
		const lineY = y + Math.round(accentH / 2);
		context.save();
		context.lineWidth = lineWidth;
		context.beginPath();
		// Shaft
		context.moveTo(x + arrowW,          lineY);
		context.lineTo(x + width - arrowW,  lineY);
		// Left arrowhead
		context.moveTo(x + arrowW, y);
		context.lineTo(x,          lineY);
		context.lineTo(x + arrowW, y + accentH);
		// Right arrowhead
		context.moveTo(x + width - arrowW, y);
		context.lineTo(x + width,          lineY);
		context.lineTo(x + width - arrowW, y + accentH);
		context.stroke();
		context.restore();
	}
};

// ─── Registration ─────────────────────────────────────────────────────────────

GeometryPackage.setExpressions = function(module) {
	Formulae.setExpression(module, "Geometry.Angle",    Angle);
	Formulae.setExpression(module, "Geometry.Triangle", Triangle);
	
	Formulae.setExpression(module, "Geometry.Parallel", {
		clazz:       Expression.Infix,
		getTag:      () => "Geometry.Parallel",
		getOperator: () => GeometryPackage.messages.operatorParallel,
		getName:     () => GeometryPackage.messages.nameParallel,
		min: -2, max: 2
	});
	
	Formulae.setExpression(module, "Geometry.Perpendicular", {
		clazz:       Expression.Infix,
		getTag:      () => "Geometry.Perpendicular",
		getOperator: () => GeometryPackage.messages.operatorPerpendicular,
		getName:     () => GeometryPackage.messages.namePerpendicular,
		min: 2, max: 2
	});
	
	Formulae.setExpression(module, "Geometry.Arc",     Arc);
	Formulae.setExpression(module, "Geometry.Segment", Segment);
	Formulae.setExpression(module, "Geometry.Ray",     Ray);
	Formulae.setExpression(module, "Geometry.Line",    Line);
};

