from pathlib import Path
import sys

from PIL import Image
from pypdf import PdfReader, PdfWriter

source = Path(sys.argv[1])
output = Path(sys.argv[2])
reader = PdfReader(source)
writer = PdfWriter()
writer.clone_document_from_reader(reader)

for page in writer.pages:
    for image_file in page.images:
        image = image_file.image.convert('RGB')
        image.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
        image_file.replace(image, quality=84, optimize=True, progressive=True)

with output.open('wb') as stream:
    compact_writer = PdfWriter()
    for page in writer.pages:
        compact_writer.add_page(page)
    compact_writer.write(stream)
