all: components css/tui.css css/tui-theme.css

css/tui.css: less/tui.less less/tui.input.less less/tui.layout.less
	mkdir -p css
	lessc -O2 --yui-compress $< $@

css/%.css: less/%.less
	mkdir -p css
	lessc -O2 --yui-compress $< $@

components: component.json
	bower install
