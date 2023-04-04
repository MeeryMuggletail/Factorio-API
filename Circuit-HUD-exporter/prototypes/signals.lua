--
-- SIGNALS
--
data:extend {
	{
		type = "item-subgroup",
		name = "circuit-hid-signals",
		group = "signals",
		order = "f"
	},
	{
		type = "virtual-signal",
		name = "signal-hide-hud-comparator",
		icon = "__Circuit-HUD-exporter__/graphics/icon/signal/signal-hide-hud-comparator.png",
		icon_size = 64,
		icon_mipmaps = 4,
		subgroup = "circuit-hid-signals",
		order = "d[hud-comparator]-[hide]"
	}
}
