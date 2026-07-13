/*
Fōrmulæ geometry package. Module for edition.
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

export class GeometryPackage extends Formulae.EditionPackage {};

GeometryPackage.setEditions = function() {
	// ─── Notation ───────────────────────────────────────────────────────────────
	Formulae.addEdition(this.messages.pathNotation, Formulae.icon("Geometry.Angle",    1), this.messages.leafAngle,    () => Expression.wrapperEdition("Geometry.Angle"));
	Formulae.addEdition(this.messages.pathNotation, Formulae.icon("Geometry.Triangle", 3), this.messages.leafTriangle, () => Expression.multipleEdition("Geometry.Triangle", 3, 0));
	Formulae.addEdition(this.messages.pathNotation, Formulae.icon("Geometry.Arc",      1), this.messages.leafArc,      () => Expression.wrapperEdition("Geometry.Arc"));
	Formulae.addEdition(this.messages.pathNotation, Formulae.icon("Geometry.Segment",  1), this.messages.leafSegment,  () => Expression.wrapperEdition("Geometry.Segment"));
	Formulae.addEdition(this.messages.pathNotation, Formulae.icon("Geometry.Ray",      1), this.messages.leafRay,      () => Expression.wrapperEdition("Geometry.Ray"));
	Formulae.addEdition(this.messages.pathNotation, Formulae.icon("Geometry.Line",     1), this.messages.leafLine,     () => Expression.wrapperEdition("Geometry.Line"));

	// ─── Relations ──────────────────────────────────────────────────────────────
	Formulae.addBinaryEdition(this.messages, "Relations", "Parallel",      "Geometry.Parallel");
	Formulae.addBinaryEdition(this.messages, "Relations", "Perpendicular", "Geometry.Perpendicular");
};

GeometryPackage.setActions = function() {};
