# https://developer.imdb.com/non-commercial-datasets/
FILES = \
https://datasets.imdbws.com/name.basics.tsv.gz \
https://datasets.imdbws.com/title.akas.tsv.gz \
https://datasets.imdbws.com/title.basics.tsv.gz \
https://datasets.imdbws.com/title.crew.tsv.gz \
https://datasets.imdbws.com/title.episode.tsv.gz \
https://datasets.imdbws.com/title.principals.tsv.gz \
https://datasets.imdbws.com/title.ratings.tsv.gz

FILENAMES = $(notdir $(FILES))

TARGETS = $(addprefix dataset/,$(FILENAMES:.gz=))

all: $(TARGETS) clean_gz generate_meta

dataset:
	@mkdir -p dataset

$(TARGETS): dataset/%: dataset/%.gz | dataset
	@echo "Unzipping $@"
	@if [ ! -f $@ ]; then \
		gzip -dk $<; \
		echo "Unzipped $@"; \
	else \
		echo "$@ already exists, skipping unzip."; \
	fi

dataset/%.gz: | dataset
	@if [ ! -f $(basename $@) ]; then \
		echo "Downloading $@"; \
		wget -O $@ $(addprefix https://datasets.imdbws.com/, $(notdir $@)); \
	else \
		echo "$(basename $@) already exists, skipping download."; \
	fi

clean_gz:
	@echo "Cleaning up .gz files"
	rm -f dataset/*.gz

clean:
	@echo "Cleaning up"
	rm -f dataset/*

generate_meta: $(TARGETS)
	@echo "Generating common/meta.json"
	@echo "{" > common/meta.json
	@for file in $(TARGETS); do \
		lines=$$(wc -l < "$$file"); \
		size=$$(stat -c %s "$$file"); \
		printf "\"%s\": {\"size\": %d, \"lines\": %d},\n" "$$file" $$size $$lines >> common/meta.json; \
	done
	@sed -i '$$s/,$$//' common/meta.json
	@echo "}" >> common/meta.json
