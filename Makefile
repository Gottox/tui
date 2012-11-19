all: css/tui.css css/tui-theme.css components

css/tui.css: less/tui.less less/tui.input.less less/tui.layout.less
	mkdir -p css
	lessc -O2 --yui-compress $< $@

css/%.css: less/%.less components
	mkdir -p css
	lessc -O2 --yui-compress $< $@

components: component.json
	bower install
