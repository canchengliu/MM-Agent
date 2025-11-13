import sys
import os

def get_file_language(file_path):
    """Get the appropriate language identifier for code blocks based on file extension"""
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()

    return ext[1:] if len(ext) > 0 else ext

def convert_folder_to_markdown(folder_path, markdown_file, extends):
    with open(markdown_file, 'w') as md_file:
        # Write the title of the markdown
        md_file.write(f"# Folder Structure of {folder_path}\n\n")

        # Walk through the directory
        for root, dirs, files in os.walk(folder_path):
            dirs.sort()
            files.sort()
            # Filter out __pycache__ directories
            dirs[:] = [d for d in dirs if d != '__pycache__']

            dirs[:] = [d for d in dirs if d != 'alembic']

            
            
            # Write the directory structure
            level = root.replace(folder_path, '').count(os.sep)
            indent = ' ' * 4 * (level)
            md_file.write(f"{indent}## {os.path.basename(root)}\n")

            # Write the files in the directory
            if files:
                for file in files:
                    md_file.write(f"{indent} - {file}\n")
            md_file.write("\n")

            # Process each file and include its content (optional)
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, folder_path)
                language = get_file_language(file_path)
                if 'venv/' in file_path or '__pycache__' in file_path:
                   continue
                
                if extends != 'all' and language not in extends.split(','):
                   continue
                try:
                    with open(file_path, 'r', encoding='utf-8') as content_file:
                        content = content_file.read()
                    md_file.write(f"### {relative_path} Content:\n\n")
                    md_file.write(f"```{language}\n{content}\n```\n\n")
                except UnicodeDecodeError:
                    md_file.write(f"### {relative_path} Content:\n\n")
                    md_file.write(f"```txt\n[Binary file or unsupported encoding - content not displayed]\n```\n\n")
                except Exception as e:
                    md_file.write(f"### {relative_path} Content:\n\n")
                    md_file.write(f"```txt\n[Error reading file: {str(e)}]\n```\n\n")


# Example usage:
folder_path = sys.argv[1]
markdown_file = sys.argv[2] + '.md'
if len(sys.argv) > 3:
    extends = sys.argv[3]
else:
    extends = 'python'

convert_folder_to_markdown(folder_path, markdown_file, extends)

