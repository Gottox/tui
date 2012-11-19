all: css/tui.css css/tui-theme.css components

css/%.css: less/%.less components
	mkdir -p css
	lessc -O2 --yui-compress $< $@

components: component.json
	bower install
