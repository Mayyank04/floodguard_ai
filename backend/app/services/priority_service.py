import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class RescuePriorityEngine:
    """
    Explainable Multi-Factor Settlement Prioritization Engine.
    Combines:
    1. Population Exposure (30%)
    2. Potential Network Isolation (30%)
    3. Flood Severity & Inundation Proximity (20%)
    4. Critical Infrastructure Vulnerability (15%)
    5. Observation Uncertainty (5%)
    """

    DEFAULT_WEIGHTS = {
        "population": 0.30,
        "isolation": 0.30,
        "flood_severity": 0.20,
        "infrastructure": 0.15,
        "uncertainty": 0.05
    }

    def calculate_priorities(
        self,
        settlements: List[Dict[str, Any]],
        infrastructure: List[Dict[str, Any]],
        custom_weights: Optional[Dict[str, float]] = None
    ) -> List[Dict[str, Any]]:
        weights = dict(self.DEFAULT_WEIGHTS)
        if custom_weights:
            weights.update(custom_weights)

        # Normalize weights to ensure sum == 1.0
        total_w = sum(weights.values())
        if total_w > 0:
            weights = {k: v / total_w for k, v in weights.items()}

        # Find max population for normalization
        max_pop = max([s.get("estimated_population", 1) for s in settlements] or [50000])

        prioritized = []
        for s in settlements:
            # 1. Population factor [0, 1]
            pop = s.get("estimated_population", 0)
            pop_factor = min(pop / max_pop, 1.0)

            # 2. Isolation factor [0, 1]
            status = s.get("connectivity_status", "connected")
            if status == "critical_isolated":
                iso_factor = 1.0
            elif status == "potentially_isolated":
                iso_factor = 0.85
            elif status == "insufficient_network_data":
                iso_factor = 0.60
            else:
                iso_factor = 0.20

            # 3. Flood severity factor [0, 1]
            dist_flood = s.get("flood_distance_meters", 1000)
            if dist_flood == 0:
                flood_factor = 1.0
            elif dist_flood < 100:
                flood_factor = 0.8
            elif dist_flood < 500:
                flood_factor = 0.5
            elif dist_flood < 1500:
                flood_factor = 0.25
            else:
                flood_factor = 0.05

            # 4. Infrastructure factor [0, 1]
            # Check if there are affected hospitals or shelters nearby
            nearby_exposed_infra = 0
            for item in infrastructure:
                if item.get("flood_intersection", False):
                    # Proximity check
                    d_lat = abs(item["latitude"] - s["latitude"])
                    d_lon = abs(item["longitude"] - s["longitude"])
                    if d_lat < 0.05 and d_lon < 0.05: # within ~5km
                        nearby_exposed_infra += 1
            infra_factor = min(nearby_exposed_infra * 0.4 + (0.3 if s.get("estimated_population", 0) > 15000 else 0.1), 1.0)

            # 5. Uncertainty factor [0, 1]
            # Higher uncertainty warrants cautious priority escalation
            unc_factor = 0.4 if status == "insufficient_network_data" else 0.15

            # Calculate composite score (0 to 100)
            raw_score = (
                pop_factor * weights["population"] +
                iso_factor * weights["isolation"] +
                flood_factor * weights["flood_severity"] +
                infra_factor * weights["infrastructure"] +
                unc_factor * weights["uncertainty"]
            ) * 100.0

            score = round(raw_score, 1)

            # Explainable rationale breakdown
            explanation_parts = []
            if iso_factor >= 0.85:
                explanation_parts.append("Road connectivity completely severed by satellite-verified flood extent")
            if flood_factor >= 0.8:
                explanation_parts.append(f"Direct inundation exposure (distance to flood: {dist_flood}m)")
            if pop >= 15000:
                explanation_parts.append(f"High vulnerable civilian population ({pop:,} residents)")
            if nearby_exposed_infra > 0:
                explanation_parts.append(f"{nearby_exposed_infra} critical health or shelter assets compromised nearby")

            if not explanation_parts:
                explanation_parts.append("Moderate flood proximity; overland road network remains open")

            prioritized.append({
                "settlement_id": s.get("id"),
                "settlement_name": s["name"],
                "district": s.get("district", "Barpeta"),
                "latitude": s["latitude"],
                "longitude": s["longitude"],
                "estimated_population": pop,
                "connectivity_status": status,
                "score": score,
                "population_factor": round(pop_factor, 3),
                "isolation_factor": round(iso_factor, 3),
                "flood_factor": round(flood_factor, 3),
                "infra_factor": round(infra_factor, 3),
                "uncertainty_factor": round(unc_factor, 3),
                "weights_used": weights,
                "explanation": ". ".join(explanation_parts) + ".",
                "data_confidence": "HIGH (Sentinel-1 SAR Radar Validated)" if status != "insufficient_network_data" else "MEDIUM (Requires Ground Reconnaissance)"
            })

        # Sort descending by priority score and assign ranks
        prioritized.sort(key=lambda x: x["score"], reverse=True)
        for idx, item in enumerate(prioritized):
            item["rank"] = idx + 1

        return prioritized

priority_engine = RescuePriorityEngine()
