from lxml import html
from colorama import Fore, Back, Style
import requests
import json
import datetime

# Config
# ------------------------------

base_url = "https://egov.uscis.gov/casestatus/mycasestatus.do?appReceiptNum="
base_xpath = "//form[@name='caseStatusForm']//*[contains(@class, ' appointment-sec ')]//*[contains(@class, 'rows')]"

cases = [
  "XYZ"
]


# Core
# ------------------------------

# Get all Case Studies data
def get_all_case_statuses(cases):
  case_statuses = []

  for case in cases:
    case_statuses.append( get_case_status(case) )
  
  return case_statuses


# Get individual Case Study data
# Returns an array of [title, paragraph content]
def get_case_status(case):
  print((
    Fore.WHITE + "Getting Case Satus: "
    + Fore.GREEN + Style.BRIGHT + "%s"
    + Fore.RESET + Style.NORMAL + " ..."
  ) % case)

  request = requests.get(base_url + case)
  tree = html.fromstring(request.content)

  return {
    'case': case,
    'status': get_form_element_text(tree, "h1"),
    'details': get_form_element_text(tree, "p")
  }


def display_case_statuses(cases):
  print("\n::" + Fore.MAGENTA + Style.BRIGHT + "  C A S E   D A T A  " + Style.NORMAL + Fore.RESET + "::")
  print("-------------------------------------")

  for case_object in cases:
    case = case_object['case']
    status = case_object['status']
    details = case_object['details']
    print("\n" + Fore.GREEN + Style.BRIGHT + case + Fore.RESET)
    print(Fore.CYAN + Style.BRIGHT + status + Fore.RESET + Style.NORMAL)
    print(Fore.WHITE + details + Fore.RESET)
  return

def save_case_statuses_json(case_statuses):
  timestamp = datetime.datetime.now().strftime("%Y-%m-%d--%H%M%S")

  with open('caseStatuses_' + timestamp + '.json', 'w') as f: 
     json.dump(case_statuses, f)

  return

# Utilities
# ------------------------------

def get_form_element_text(tree, xpath):
  full_xpath = base_xpath + "//" + xpath + "/text()"
  return get_string_from_list( tree.xpath(full_xpath) )

def get_string_from_list(list):
  return "".join(list)


# Application
# ------------------------------
case_statuses = get_all_case_statuses(cases)
display_case_statuses(case_statuses)
save_case_statuses_json(case_statuses)
print(json.dumps(case_statuses))